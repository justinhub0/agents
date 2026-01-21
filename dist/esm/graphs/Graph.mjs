import { nanoid } from 'nanoid';
import { concat } from '@langchain/core/utils/stream';
import { ChatVertexAI } from '@langchain/google-vertexai';
import { Annotation, messagesStateReducer, StateGraph, START, END } from '@langchain/langgraph';
import { RunnableLambda } from '@langchain/core/runnables';
import { SystemMessage, AIMessageChunk, ToolMessage } from '@langchain/core/messages';
import { GraphNodeKeys, ContentTypes, Providers, GraphEvents, StepTypes, Constants } from '../common/enum.mjs';
import { convertMessagesToContent, modifyDeltaProperties, formatAnthropicArtifactContent, formatArtifactPayload } from '../messages/core.mjs';
import { createPruneMessages } from '../messages/prune.mjs';
import { ensureThinkingBlockInMessages } from '../messages/format.mjs';
import { addCacheControl, addBedrockCacheControl } from '../messages/cache.mjs';
import { formatContentStrings } from '../messages/content.mjs';
import { extractToolDiscoveries } from '../messages/tools.mjs';
import { resetIfNotEmpty, joinKeys } from '../utils/graph.mjs';
import { isOpenAILike, isGoogleLike } from '../utils/llm.mjs';
import { sleep } from '../utils/run.mjs';
import 'js-tiktoken/lite';
import { getChatModelClass, manualToolStreamProviders } from '../llm/providers.mjs';
import { ToolNode, toolsCondition } from '../tools/ToolNode.mjs';
import { ChatOpenAI, AzureChatOpenAI } from '../llm/openai/index.mjs';
import { safeDispatchCustomEvent } from '../utils/events.mjs';
import { AgentContext } from '../agents/AgentContext.mjs';
import { createFakeStreamingLLM } from '../llm/fake.mjs';

/* eslint-disable no-console */
// src/graphs/Graph.ts
const { AGENT, TOOLS } = GraphNodeKeys;
/**
 * Model context windows for compaction threshold calculation
 */
const MODEL_CONTEXT_WINDOWS = {
    'gpt-5.2': 128000,
    'gpt-5.2-pro': 128000,
    'gpt-5.2-codex': 128000,
};
/**
 * Get the context window size for a model
 */
function getModelContextWindow(model) {
    const lowerModel = model.toLowerCase();
    for (const [key, value] of Object.entries(MODEL_CONTEXT_WINDOWS)) {
        if (lowerModel.includes(key)) {
            return value;
        }
    }
    return 128000;
}
/**
 * Check if a model supports compaction
 */
function supportsCompaction(model) {
    if (!model)
        return false;
    const lowerModel = model.toLowerCase();
    return lowerModel.includes('gpt-5.2');
}
/**
 * Estimate tokens for a message (rough estimation: 4 chars per token)
 */
function estimateMessageTokens(message) {
    const content = message.content;
    if (typeof content === 'string') {
        return Math.ceil(content.length / 4);
    }
    if (Array.isArray(content)) {
        return Math.ceil(JSON.stringify(content).length / 4);
    }
    return 0;
}
/**
 * Truncate messages to fit within context window when compaction isn't enough.
 * Keeps system message and most recent messages, removes old middle messages.
 */
function truncateToFitContext(messages, maxTokens, reserveTokens = 8000) {
    const targetTokens = maxTokens - reserveTokens; // Leave room for response
    let totalTokens = messages.reduce((sum, m) => sum + estimateMessageTokens(m), 0);
    if (totalTokens <= targetTokens) {
        return messages;
    }
    console.log(`[Truncation] Messages exceed ${targetTokens} tokens (${totalTokens}), truncating...`);
    // Keep system message (first) and recent messages, remove from middle
    const result = [];
    let currentTokens = 0;
    // Always keep system message if present
    const firstMsg = messages[0];
    if (firstMsg && firstMsg._getType() === 'system') {
        result.push(firstMsg);
        currentTokens += estimateMessageTokens(firstMsg);
    }
    // Add messages from the end until we hit the limit
    const remainingMessages = firstMsg?._getType() === 'system' ? messages.slice(1) : messages;
    const messagesToAdd = [];
    for (let i = remainingMessages.length - 1; i >= 0; i--) {
        const msg = remainingMessages[i];
        const msgTokens = estimateMessageTokens(msg);
        if (currentTokens + msgTokens <= targetTokens) {
            messagesToAdd.unshift(msg);
            currentTokens += msgTokens;
        }
        else {
            // Skip this message and older ones
            break;
        }
    }
    result.push(...messagesToAdd);
    console.log(`[Truncation] Reduced from ${totalTokens} to ${currentTokens} tokens (${result.length} messages)`);
    return result;
}
/**
 * Convert BaseMessage to OpenAI Responses API format
 * Note: Tool messages are converted to user messages since /responses/compact
 * only supports 'assistant', 'system', 'developer', and 'user' roles
 */
function convertToResponsesFormat(messages) {
    const result = [];
    for (const msg of messages) {
        const msgType = msg._getType();
        let role;
        let content;
        // Convert content to string
        if (typeof msg.content === 'string') {
            content = msg.content;
        }
        else if (Array.isArray(msg.content)) {
            // Handle content arrays by extracting text
            content = msg.content
                .map((c) => {
                if (typeof c === 'string')
                    return c;
                if (typeof c === 'object' && c !== null && 'text' in c) {
                    return c.text;
                }
                return JSON.stringify(c);
            })
                .join('\n');
        }
        else {
            content = JSON.stringify(msg.content);
        }
        // Skip empty content
        if (!content || content.trim() === '') {
            continue;
        }
        if (msgType === 'human') {
            role = 'user';
        }
        else if (msgType === 'ai') {
            role = 'assistant';
            // For AI messages with tool calls but no text content, add a placeholder
            if (!content.trim() && 'tool_calls' in msg && msg.tool_calls) {
                content = '[Tool calls made]';
            }
        }
        else if (msgType === 'system') {
            role = 'system';
        }
        else if (msgType === 'tool') {
            // Convert tool messages to user messages with context
            role = 'user';
            const toolName = 'name' in msg ? msg.name : 'tool';
            content = `[Tool result from ${toolName}]: ${content}`;
        }
        else {
            role = 'user';
        }
        result.push({ role, content });
    }
    return result;
}
/**
 * Call the OpenAI /responses/compact endpoint to compact conversation
 */
async function compactConversation(messages, config, model, instructions) {
    const thresholdPercent = config.thresholdPercent ?? 0.7;
    const minTokens = config.minTokensBeforeCompaction ?? 10000;
    const contextWindow = getModelContextWindow(model);
    const threshold = contextWindow * thresholdPercent;
    // Estimate current tokens
    let totalTokens = 0;
    for (const msg of messages) {
        totalTokens += estimateMessageTokens(msg);
    }
    if (instructions) {
        totalTokens += Math.ceil(instructions.length / 4);
    }
    console.log(`[Compaction] Token estimate: ${totalTokens}, threshold: ${threshold}, minTokens: ${minTokens}`);
    // Check if compaction should trigger
    if (totalTokens < minTokens || totalTokens < threshold) {
        return { compacted: false, originalTokens: totalTokens };
    }
    console.log(`[Compaction] Triggering compaction for ${totalTokens} tokens`);
    try {
        const input = convertToResponsesFormat(messages);
        const baseURL = config.baseURL || 'https://api.openai.com/v1';
        const response = await fetch(`${baseURL}/responses/compact`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
                model,
                input,
                ...(instructions && config.preserveInstructions !== false
                    ? { instructions }
                    : {}),
            }),
        });
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[Compaction] API error: ${response.status} - ${errorText}`);
            return { compacted: false, originalTokens: totalTokens };
        }
        // The compaction API returns items that may include:
        // - {type: "message", role: "user", content: "..."} - user messages kept verbatim
        // - {type: "compaction", encrypted_content: "..."} - encrypted compaction item
        const data = (await response.json());
        if (!data.output || data.output.length === 0) {
            console.warn('[Compaction] No output from compaction API');
            return { compacted: false, originalTokens: totalTokens };
        }
        console.log(`[Compaction] API returned ${data.output.length} items`);
        // Log the types of items returned
        const itemTypes = data.output.map((item) => item.type || item.role || 'unknown');
        console.log(`[Compaction] Item types: ${itemTypes.join(', ')}`);
        // Create a single AIMessage that carries all the compacted items in response_metadata.output
        // This allows _convertMessagesToOpenAIResponsesParams to pass them through directly
        const { AIMessage } = await import('@langchain/core/messages');
        const compactedMessage = new AIMessage({
            content: '[Compacted conversation context]',
            response_metadata: {
                output: data.output, // Raw items from compaction API - will be passed through directly
            },
        });
        const compactedTokens = data.usage?.output_tokens || data.usage?.total_tokens || 1000;
        console.log(`[Compaction] Compacted: ${totalTokens} -> ${compactedTokens} tokens (${data.output.length} items preserved in response_metadata)`);
        return {
            compacted: true,
            messages: [compactedMessage], // Single message carrying all compacted items
            originalTokens: totalTokens,
            compactedTokens,
        };
    }
    catch (error) {
        console.error('[Compaction] Error during compaction:', error);
        return { compacted: false, originalTokens: totalTokens };
    }
}
class Graph {
    messageStepHasToolCalls = new Map();
    messageIdsByStepKey = new Map();
    prelimMessageIdsByStepKey = new Map();
    config;
    contentData = [];
    stepKeyIds = new Map();
    contentIndexMap = new Map();
    toolCallStepIds = new Map();
    signal;
    /** Set of invoked tool call IDs from non-message run steps completed mid-run, if any */
    invokedToolIds;
    handlerRegistry;
    /**
     * Tool session contexts for automatic state persistence across tool invocations.
     * Keyed by tool name (e.g., Constants.EXECUTE_CODE).
     * Currently supports code execution session tracking (session_id, files).
     */
    sessions = new Map();
}
class StandardGraph extends Graph {
    overrideModel;
    /** Optional compile options passed into workflow.compile() */
    compileOptions;
    messages = [];
    runId;
    startIndex = 0;
    signal;
    /** Map of agent contexts by agent ID */
    agentContexts = new Map();
    /** Default agent ID to use */
    defaultAgentId;
    constructor({ 
    // parent-level graph inputs
    runId, signal, agents, tokenCounter, indexTokenCountMap, }) {
        super();
        this.runId = runId;
        this.signal = signal;
        if (agents.length === 0) {
            throw new Error('At least one agent configuration is required');
        }
        for (const agentConfig of agents) {
            const agentContext = AgentContext.fromConfig(agentConfig, tokenCounter, indexTokenCountMap);
            this.agentContexts.set(agentConfig.agentId, agentContext);
        }
        this.defaultAgentId = agents[0].agentId;
    }
    /* Init */
    resetValues(keepContent) {
        this.messages = [];
        this.config = resetIfNotEmpty(this.config, undefined);
        if (keepContent !== true) {
            this.contentData = resetIfNotEmpty(this.contentData, []);
            this.contentIndexMap = resetIfNotEmpty(this.contentIndexMap, new Map());
        }
        this.stepKeyIds = resetIfNotEmpty(this.stepKeyIds, new Map());
        this.toolCallStepIds = resetIfNotEmpty(this.toolCallStepIds, new Map());
        this.messageIdsByStepKey = resetIfNotEmpty(this.messageIdsByStepKey, new Map());
        this.messageStepHasToolCalls = resetIfNotEmpty(this.messageStepHasToolCalls, new Map());
        this.prelimMessageIdsByStepKey = resetIfNotEmpty(this.prelimMessageIdsByStepKey, new Map());
        this.invokedToolIds = resetIfNotEmpty(this.invokedToolIds, undefined);
        for (const context of this.agentContexts.values()) {
            context.reset();
        }
    }
    /* Run Step Processing */
    getRunStep(stepId) {
        const index = this.contentIndexMap.get(stepId);
        if (index !== undefined) {
            return this.contentData[index];
        }
        return undefined;
    }
    getAgentContext(metadata) {
        if (!metadata) {
            throw new Error('No metadata provided to retrieve agent context');
        }
        const currentNode = metadata.langgraph_node;
        if (!currentNode) {
            throw new Error('No langgraph_node in metadata to retrieve agent context');
        }
        let agentId;
        if (currentNode.startsWith(AGENT)) {
            agentId = currentNode.substring(AGENT.length);
        }
        else if (currentNode.startsWith(TOOLS)) {
            agentId = currentNode.substring(TOOLS.length);
        }
        const agentContext = this.agentContexts.get(agentId ?? '');
        if (!agentContext) {
            throw new Error(`No agent context found for agent ID ${agentId}`);
        }
        return agentContext;
    }
    getStepKey(metadata) {
        if (!metadata)
            return '';
        const keyList = this.getKeyList(metadata);
        if (this.checkKeyList(keyList)) {
            throw new Error('Missing metadata');
        }
        return joinKeys(keyList);
    }
    getStepIdByKey(stepKey, index) {
        const stepIds = this.stepKeyIds.get(stepKey);
        if (!stepIds) {
            throw new Error(`No step IDs found for stepKey ${stepKey}`);
        }
        if (index === undefined) {
            return stepIds[stepIds.length - 1];
        }
        return stepIds[index];
    }
    generateStepId(stepKey) {
        const stepIds = this.stepKeyIds.get(stepKey);
        let newStepId;
        let stepIndex = 0;
        if (stepIds) {
            stepIndex = stepIds.length;
            newStepId = `step_${nanoid()}`;
            stepIds.push(newStepId);
            this.stepKeyIds.set(stepKey, stepIds);
        }
        else {
            newStepId = `step_${nanoid()}`;
            this.stepKeyIds.set(stepKey, [newStepId]);
        }
        return [newStepId, stepIndex];
    }
    getKeyList(metadata) {
        if (!metadata)
            return [];
        const keyList = [
            metadata.run_id,
            metadata.thread_id,
            metadata.langgraph_node,
            metadata.langgraph_step,
            metadata.checkpoint_ns,
        ];
        const agentContext = this.getAgentContext(metadata);
        if (agentContext.currentTokenType === ContentTypes.THINK ||
            agentContext.currentTokenType === 'think_and_text') {
            keyList.push('reasoning');
        }
        else if (agentContext.tokenTypeSwitch === 'content') {
            keyList.push('post-reasoning');
        }
        if (this.invokedToolIds != null && this.invokedToolIds.size > 0) {
            keyList.push(this.invokedToolIds.size + '');
        }
        return keyList;
    }
    checkKeyList(keyList) {
        return keyList.some((key) => key === undefined);
    }
    /* Misc.*/
    getRunMessages() {
        return this.messages.slice(this.startIndex);
    }
    getContentParts() {
        return convertMessagesToContent(this.messages.slice(this.startIndex));
    }
    /**
     * Get all run steps, optionally filtered by agent ID
     */
    getRunSteps(agentId) {
        if (agentId == null || agentId === '') {
            return [...this.contentData];
        }
        return this.contentData.filter((step) => step.agentId === agentId);
    }
    /**
     * Get run steps grouped by agent ID
     */
    getRunStepsByAgent() {
        const stepsByAgent = new Map();
        for (const step of this.contentData) {
            if (step.agentId == null || step.agentId === '')
                continue;
            const steps = stepsByAgent.get(step.agentId) ?? [];
            steps.push(step);
            stepsByAgent.set(step.agentId, steps);
        }
        return stepsByAgent;
    }
    /**
     * Get agent IDs that participated in this run
     */
    getActiveAgentIds() {
        const agentIds = new Set();
        for (const step of this.contentData) {
            if (step.agentId != null && step.agentId !== '') {
                agentIds.add(step.agentId);
            }
        }
        return Array.from(agentIds);
    }
    /**
     * Maps contentPart indices to agent IDs for post-run analysis
     * Returns a map where key is the contentPart index and value is the agentId
     */
    getContentPartAgentMap() {
        const contentPartAgentMap = new Map();
        for (const step of this.contentData) {
            if (step.agentId != null &&
                step.agentId !== '' &&
                Number.isFinite(step.index)) {
                contentPartAgentMap.set(step.index, step.agentId);
            }
        }
        return contentPartAgentMap;
    }
    /* Graph */
    createSystemRunnable({ provider, clientOptions, instructions, additional_instructions, }) {
        let finalInstructions = instructions;
        if (additional_instructions != null && additional_instructions !== '') {
            finalInstructions =
                finalInstructions != null && finalInstructions
                    ? `${finalInstructions}\n\n${additional_instructions}`
                    : additional_instructions;
        }
        if (finalInstructions != null &&
            finalInstructions &&
            provider === Providers.ANTHROPIC &&
            clientOptions.promptCache === true) {
            finalInstructions = {
                content: [
                    {
                        type: 'text',
                        text: instructions,
                        cache_control: { type: 'ephemeral' },
                    },
                ],
            };
        }
        if (finalInstructions != null && finalInstructions !== '') {
            const systemMessage = new SystemMessage(finalInstructions);
            return RunnableLambda.from((messages) => {
                return [systemMessage, ...messages];
            }).withConfig({ runName: 'prompt' });
        }
    }
    initializeTools({ currentTools, currentToolMap, agentContext, }) {
        return new ToolNode({
            tools: currentTools ?? [],
            toolMap: currentToolMap,
            toolCallStepIds: this.toolCallStepIds,
            errorHandler: (data, metadata) => StandardGraph.handleToolCallErrorStatic(this, data, metadata),
            toolRegistry: agentContext?.toolRegistry,
            sessions: this.sessions,
        });
    }
    initializeModel({ provider, tools, clientOptions, }) {
        const ChatModelClass = getChatModelClass(provider);
        const model = new ChatModelClass(clientOptions ?? {});
        if (isOpenAILike(provider) &&
            (model instanceof ChatOpenAI || model instanceof AzureChatOpenAI)) {
            model.temperature = clientOptions
                .temperature;
            model.topP = clientOptions.topP;
            model.frequencyPenalty = clientOptions
                .frequencyPenalty;
            model.presencePenalty = clientOptions
                .presencePenalty;
            model.n = clientOptions.n;
        }
        else if (provider === Providers.VERTEXAI &&
            model instanceof ChatVertexAI) {
            model.temperature = clientOptions
                .temperature;
            model.topP = clientOptions.topP;
            model.topK = clientOptions.topK;
            model.topLogprobs = clientOptions
                .topLogprobs;
            model.frequencyPenalty = clientOptions
                .frequencyPenalty;
            model.presencePenalty = clientOptions
                .presencePenalty;
            model.maxOutputTokens = clientOptions
                .maxOutputTokens;
        }
        if (!tools || tools.length === 0) {
            return model;
        }
        return model.bindTools(tools);
    }
    overrideTestModel(responses, sleep, toolCalls) {
        this.overrideModel = createFakeStreamingLLM({
            responses,
            sleep,
            toolCalls,
        });
    }
    getNewModel({ provider, clientOptions, }) {
        const ChatModelClass = getChatModelClass(provider);
        return new ChatModelClass(clientOptions ?? {});
    }
    getUsageMetadata(finalMessage) {
        if (finalMessage &&
            'usage_metadata' in finalMessage &&
            finalMessage.usage_metadata != null) {
            return finalMessage.usage_metadata;
        }
    }
    /** Execute model invocation with streaming support */
    async attemptInvoke({ currentModel, finalMessages, provider, tools, }, config) {
        const model = this.overrideModel ?? currentModel;
        if (!model) {
            throw new Error('No model found');
        }
        if ((tools?.length ?? 0) > 0 && manualToolStreamProviders.has(provider)) {
            if (!model.stream) {
                throw new Error('Model does not support stream');
            }
            const stream = await model.stream(finalMessages, config);
            let finalChunk;
            for await (const chunk of stream) {
                await safeDispatchCustomEvent(GraphEvents.CHAT_MODEL_STREAM, { chunk, emitted: true }, config);
                finalChunk = finalChunk ? concat(finalChunk, chunk) : chunk;
            }
            finalChunk = modifyDeltaProperties(provider, finalChunk);
            return { messages: [finalChunk] };
        }
        else {
            const finalMessage = await model.invoke(finalMessages, config);
            if ((finalMessage.tool_calls?.length ?? 0) > 0) {
                finalMessage.tool_calls = finalMessage.tool_calls?.filter((tool_call) => !!tool_call.name);
            }
            return { messages: [finalMessage] };
        }
    }
    cleanupSignalListener(currentModel) {
        if (!this.signal) {
            return;
        }
        const model = this.overrideModel ?? currentModel;
        if (!model) {
            return;
        }
        const client = model?.exposedClient;
        if (!client?.abortHandler) {
            return;
        }
        this.signal.removeEventListener('abort', client.abortHandler);
        client.abortHandler = undefined;
    }
    createCallModel(agentId = 'default') {
        return async (state, config) => {
            /**
             * Get agent context - it must exist by this point
             */
            const agentContext = this.agentContexts.get(agentId);
            if (!agentContext) {
                throw new Error(`Agent context not found for agentId: ${agentId}`);
            }
            if (!config) {
                throw new Error('No config provided');
            }
            const { messages } = state;
            // Extract tool discoveries from current turn only (similar to formatArtifactPayload pattern)
            const discoveredNames = extractToolDiscoveries(messages);
            if (discoveredNames.length > 0) {
                agentContext.markToolsAsDiscovered(discoveredNames);
            }
            const toolsForBinding = agentContext.getToolsForBinding();
            let model = this.overrideModel ??
                this.initializeModel({
                    tools: toolsForBinding,
                    provider: agentContext.provider,
                    clientOptions: agentContext.clientOptions,
                });
            if (agentContext.systemRunnable) {
                model = agentContext.systemRunnable.pipe(model);
            }
            if (agentContext.tokenCalculationPromise) {
                await agentContext.tokenCalculationPromise;
            }
            if (!config.signal) {
                config.signal = this.signal;
            }
            this.config = config;
            let messagesToUse = messages;
            if (!agentContext.pruneMessages &&
                agentContext.tokenCounter &&
                agentContext.maxContextTokens != null &&
                agentContext.indexTokenCountMap[0] != null) {
                const isAnthropicWithThinking = (agentContext.provider === Providers.ANTHROPIC &&
                    agentContext.clientOptions.thinking !=
                        null) ||
                    (agentContext.provider === Providers.BEDROCK &&
                        agentContext.clientOptions
                            .additionalModelRequestFields?.['thinking'] != null) ||
                    (agentContext.provider === Providers.OPENAI &&
                        agentContext.clientOptions.modelKwargs
                            ?.thinking?.type === 'enabled');
                agentContext.pruneMessages = createPruneMessages({
                    startIndex: this.startIndex,
                    provider: agentContext.provider,
                    tokenCounter: agentContext.tokenCounter,
                    maxTokens: agentContext.maxContextTokens,
                    thinkingEnabled: isAnthropicWithThinking,
                    indexTokenCountMap: agentContext.indexTokenCountMap,
                });
            }
            if (agentContext.pruneMessages) {
                const { context, indexTokenCountMap } = agentContext.pruneMessages({
                    messages,
                    usageMetadata: agentContext.currentUsage,
                    // startOnMessageType: 'human',
                });
                agentContext.indexTokenCountMap = indexTokenCountMap;
                messagesToUse = context;
            }
            /**
             * Context compaction check - runs between agent loop iterations.
             * When token count approaches context limit, compress conversation
             * using OpenAI's /responses/compact endpoint.
             */
            const modelName = agentContext.clientOptions?.model || '';
            const compactionEnabled = agentContext.compaction?.enabled;
            const hasApiKey = !!agentContext.compaction?.apiKey;
            const modelSupported = supportsCompaction(modelName);
            console.log(`[Compaction] Check - enabled: ${compactionEnabled}, apiKey: ${hasApiKey}, model: ${modelName}, supported: ${modelSupported}`);
            if (compactionEnabled && hasApiKey && modelSupported && agentContext.compaction) {
                const compactionResult = await compactConversation(messagesToUse, agentContext.compaction, modelName, agentContext.instructions);
                if (compactionResult.compacted && compactionResult.messages) {
                    console.log(`[Compaction] Using compacted messages: ${compactionResult.originalTokens} -> ${compactionResult.compactedTokens} tokens`);
                    messagesToUse = compactionResult.messages;
                    // Reset token count map since messages have been compacted
                    agentContext.indexTokenCountMap = {};
                }
                // If still over context limit after compaction, truncate as fallback
                const contextWindow = getModelContextWindow(modelName);
                const currentTokens = messagesToUse.reduce((sum, m) => sum + estimateMessageTokens(m), 0);
                if (currentTokens > contextWindow * 0.9) {
                    console.log(`[Compaction] Still over limit after compaction (${currentTokens} > ${contextWindow * 0.9}), applying truncation...`);
                    messagesToUse = truncateToFitContext(messagesToUse, contextWindow);
                    agentContext.indexTokenCountMap = {};
                }
            }
            let finalMessages = messagesToUse;
            if (agentContext.useLegacyContent) {
                finalMessages = formatContentStrings(finalMessages);
            }
            const lastMessageX = finalMessages.length >= 2
                ? finalMessages[finalMessages.length - 2]
                : null;
            const lastMessageY = finalMessages.length >= 1
                ? finalMessages[finalMessages.length - 1]
                : null;
            if (agentContext.provider === Providers.BEDROCK &&
                lastMessageX instanceof AIMessageChunk &&
                lastMessageY instanceof ToolMessage &&
                typeof lastMessageX.content === 'string') {
                finalMessages[finalMessages.length - 2].content = '';
            }
            const isLatestToolMessage = lastMessageY instanceof ToolMessage;
            if (isLatestToolMessage &&
                agentContext.provider === Providers.ANTHROPIC) {
                formatAnthropicArtifactContent(finalMessages);
            }
            else if (isLatestToolMessage &&
                ((isOpenAILike(agentContext.provider) &&
                    agentContext.provider !== Providers.DEEPSEEK) ||
                    isGoogleLike(agentContext.provider))) {
                formatArtifactPayload(finalMessages);
            }
            if (agentContext.provider === Providers.ANTHROPIC) {
                const anthropicOptions = agentContext.clientOptions;
                if (anthropicOptions?.promptCache === true) {
                    finalMessages = addCacheControl(finalMessages);
                }
            }
            else if (agentContext.provider === Providers.BEDROCK) {
                const bedrockOptions = agentContext.clientOptions;
                if (bedrockOptions?.promptCache === true) {
                    finalMessages = addBedrockCacheControl(finalMessages);
                }
            }
            /**
             * Handle edge case: when switching from a non-thinking agent to a thinking-enabled agent,
             * convert AI messages with tool calls to HumanMessages to avoid thinking block requirements.
             * This is required by Anthropic/Bedrock when thinking is enabled.
             */
            const isAnthropicWithThinking = (agentContext.provider === Providers.ANTHROPIC &&
                agentContext.clientOptions.thinking !=
                    null) ||
                (agentContext.provider === Providers.BEDROCK &&
                    agentContext.clientOptions
                        .additionalModelRequestFields?.['thinking'] != null);
            if (isAnthropicWithThinking) {
                finalMessages = ensureThinkingBlockInMessages(finalMessages, agentContext.provider);
            }
            if (agentContext.lastStreamCall != null &&
                agentContext.streamBuffer != null) {
                const timeSinceLastCall = Date.now() - agentContext.lastStreamCall;
                if (timeSinceLastCall < agentContext.streamBuffer) {
                    const timeToWait = Math.ceil((agentContext.streamBuffer - timeSinceLastCall) / 1000) *
                        1000;
                    await sleep(timeToWait);
                }
            }
            agentContext.lastStreamCall = Date.now();
            let result;
            const fallbacks = agentContext.clientOptions?.fallbacks ??
                [];
            if (finalMessages.length === 0) {
                throw new Error(JSON.stringify({
                    type: 'empty_messages',
                    info: 'Message pruning removed all messages as none fit in the context window. Please increase the context window size or make your message shorter.',
                }));
            }
            try {
                result = await this.attemptInvoke({
                    currentModel: model,
                    finalMessages,
                    provider: agentContext.provider,
                    tools: agentContext.tools,
                }, config);
            }
            catch (primaryError) {
                let lastError = primaryError;
                for (const fb of fallbacks) {
                    try {
                        let model = this.getNewModel({
                            provider: fb.provider,
                            clientOptions: fb.clientOptions,
                        });
                        const bindableTools = agentContext.tools;
                        model = (!bindableTools || bindableTools.length === 0
                            ? model
                            : model.bindTools(bindableTools));
                        result = await this.attemptInvoke({
                            currentModel: model,
                            finalMessages,
                            provider: fb.provider,
                            tools: agentContext.tools,
                        }, config);
                        lastError = undefined;
                        break;
                    }
                    catch (e) {
                        lastError = e;
                        continue;
                    }
                }
                if (lastError !== undefined) {
                    throw lastError;
                }
            }
            if (!result) {
                throw new Error('No result after model invocation');
            }
            agentContext.currentUsage = this.getUsageMetadata(result.messages?.[0]);
            this.cleanupSignalListener();
            return result;
        };
    }
    createAgentNode(agentId) {
        const agentContext = this.agentContexts.get(agentId);
        if (!agentContext) {
            throw new Error(`Agent context not found for agentId: ${agentId}`);
        }
        const agentNode = `${AGENT}${agentId}`;
        const toolNode = `${TOOLS}${agentId}`;
        const routeMessage = (state, config) => {
            this.config = config;
            return toolsCondition(state, toolNode, this.invokedToolIds);
        };
        const StateAnnotation = Annotation.Root({
            messages: Annotation({
                reducer: messagesStateReducer,
                default: () => [],
            }),
        });
        const workflow = new StateGraph(StateAnnotation)
            .addNode(agentNode, this.createCallModel(agentId))
            .addNode(toolNode, this.initializeTools({
            currentTools: agentContext.tools,
            currentToolMap: agentContext.toolMap,
            agentContext,
        }))
            .addEdge(START, agentNode)
            .addConditionalEdges(agentNode, routeMessage)
            .addEdge(toolNode, agentContext.toolEnd ? END : agentNode);
        // Cast to unknown to avoid tight coupling to external types; options are opt-in
        return workflow.compile(this.compileOptions);
    }
    createWorkflow() {
        /** Use the default (first) agent for now */
        const agentNode = this.createAgentNode(this.defaultAgentId);
        const StateAnnotation = Annotation.Root({
            messages: Annotation({
                reducer: (a, b) => {
                    if (!a.length) {
                        this.startIndex = a.length + b.length;
                    }
                    const result = messagesStateReducer(a, b);
                    this.messages = result;
                    return result;
                },
                default: () => [],
            }),
        });
        const workflow = new StateGraph(StateAnnotation)
            .addNode(this.defaultAgentId, agentNode, { ends: [END] })
            .addEdge(START, this.defaultAgentId)
            .compile();
        return workflow;
    }
    /**
     * Indicates if this is a multi-agent graph.
     * Override in MultiAgentGraph to return true.
     * Used to conditionally include agentId in RunStep for frontend rendering.
     */
    isMultiAgentGraph() {
        return false;
    }
    /**
     * Get the parallel group ID for an agent, if any.
     * Override in MultiAgentGraph to provide actual group IDs.
     * Group IDs are incrementing numbers (1, 2, 3...) reflecting execution order.
     * @param _agentId - The agent ID to look up
     * @returns undefined for StandardGraph (no parallel groups), or group number for MultiAgentGraph
     */
    getParallelGroupIdForAgent(_agentId) {
        return undefined;
    }
    /* Dispatchers */
    /**
     * Dispatches a run step to the client, returns the step ID
     */
    async dispatchRunStep(stepKey, stepDetails, metadata) {
        if (!this.config) {
            throw new Error('No config provided');
        }
        const [stepId, stepIndex] = this.generateStepId(stepKey);
        if (stepDetails.type === StepTypes.TOOL_CALLS && stepDetails.tool_calls) {
            for (const tool_call of stepDetails.tool_calls) {
                const toolCallId = tool_call.id ?? '';
                if (!toolCallId || this.toolCallStepIds.has(toolCallId)) {
                    continue;
                }
                this.toolCallStepIds.set(toolCallId, stepId);
            }
        }
        const runStep = {
            stepIndex,
            id: stepId,
            type: stepDetails.type,
            index: this.contentData.length,
            stepDetails,
            usage: null,
        };
        const runId = this.runId ?? '';
        if (runId) {
            runStep.runId = runId;
        }
        /**
         * Extract agentId and parallelGroupId from metadata
         * Only set agentId for MultiAgentGraph (so frontend knows when to show agent labels)
         */
        if (metadata) {
            try {
                const agentContext = this.getAgentContext(metadata);
                if (this.isMultiAgentGraph() && agentContext.agentId) {
                    // Only include agentId for MultiAgentGraph - enables frontend to show agent labels
                    runStep.agentId = agentContext.agentId;
                    // Set group ID if this agent is part of a parallel group
                    // Group IDs are incrementing numbers (1, 2, 3...) reflecting execution order
                    const groupId = this.getParallelGroupIdForAgent(agentContext.agentId);
                    if (groupId != null) {
                        runStep.groupId = groupId;
                    }
                }
            }
            catch (_e) {
                /** If we can't get agent context, that's okay - agentId remains undefined */
            }
        }
        this.contentData.push(runStep);
        this.contentIndexMap.set(stepId, runStep.index);
        await safeDispatchCustomEvent(GraphEvents.ON_RUN_STEP, runStep, this.config);
        return stepId;
    }
    async handleToolCallCompleted(data, metadata, omitOutput) {
        if (!this.config) {
            throw new Error('No config provided');
        }
        if (!data.output) {
            return;
        }
        const { input, output: _output } = data;
        if (_output?.lg_name === 'Command') {
            return;
        }
        const output = _output;
        const { tool_call_id } = output;
        const stepId = this.toolCallStepIds.get(tool_call_id) ?? '';
        if (!stepId) {
            throw new Error(`No stepId found for tool_call_id ${tool_call_id}`);
        }
        const runStep = this.getRunStep(stepId);
        if (!runStep) {
            throw new Error(`No run step found for stepId ${stepId}`);
        }
        /**
         * Extract and store code execution session context from artifacts.
         * Each file is stamped with its source session_id to support multi-session file tracking.
         * When the same filename appears in a later execution, the newer version replaces the old.
         */
        const toolName = output.name;
        if (toolName === Constants.EXECUTE_CODE ||
            toolName === Constants.PROGRAMMATIC_TOOL_CALLING) {
            const artifact = output.artifact;
            const newFiles = artifact?.files ?? [];
            const hasNewFiles = newFiles.length > 0;
            if (hasNewFiles &&
                artifact?.session_id != null &&
                artifact.session_id !== '') {
                /**
                 * Stamp each new file with its source session_id.
                 * This enables files from different executions (parallel or sequential)
                 * to be tracked and passed to subsequent calls.
                 */
                const filesWithSession = newFiles.map((file) => ({
                    ...file,
                    session_id: artifact.session_id,
                }));
                const existingSession = this.sessions.get(Constants.EXECUTE_CODE);
                const existingFiles = existingSession?.files ?? [];
                /**
                 * Merge files, preferring latest versions by name.
                 * If a file with the same name exists, replace it with the new version.
                 * This handles cases where files are edited/recreated in subsequent executions.
                 */
                const newFileNames = new Set(filesWithSession.map((f) => f.name));
                const filteredExisting = existingFiles.filter((f) => !newFileNames.has(f.name));
                this.sessions.set(Constants.EXECUTE_CODE, {
                    /** Keep latest session_id for reference/fallback */
                    session_id: artifact.session_id,
                    /** Accumulated files with latest versions preferred */
                    files: [...filteredExisting, ...filesWithSession],
                    lastUpdated: Date.now(),
                });
            }
        }
        const dispatchedOutput = typeof output.content === 'string'
            ? output.content
            : JSON.stringify(output.content);
        const args = typeof input === 'string' ? input : input.input;
        const tool_call = {
            args: typeof args === 'string' ? args : JSON.stringify(args),
            name: output.name ?? '',
            id: output.tool_call_id,
            output: omitOutput === true ? '' : dispatchedOutput,
            progress: 1,
        };
        await this.handlerRegistry
            ?.getHandler(GraphEvents.ON_RUN_STEP_COMPLETED)
            ?.handle(GraphEvents.ON_RUN_STEP_COMPLETED, {
            result: {
                id: stepId,
                index: runStep.index,
                type: 'tool_call',
                tool_call,
            },
        }, metadata, this);
    }
    /**
     * Static version of handleToolCallError to avoid creating strong references
     * that prevent garbage collection
     */
    static async handleToolCallErrorStatic(graph, data, metadata) {
        if (!graph.config) {
            throw new Error('No config provided');
        }
        if (!data.id) {
            console.warn('No Tool ID provided for Tool Error');
            return;
        }
        const stepId = graph.toolCallStepIds.get(data.id) ?? '';
        if (!stepId) {
            throw new Error(`No stepId found for tool_call_id ${data.id}`);
        }
        const { name, input: args, error } = data;
        const runStep = graph.getRunStep(stepId);
        if (!runStep) {
            throw new Error(`No run step found for stepId ${stepId}`);
        }
        const tool_call = {
            id: data.id,
            name: name || '',
            args: typeof args === 'string' ? args : JSON.stringify(args),
            output: `Error processing tool${error?.message != null ? `: ${error.message}` : ''}`,
            progress: 1,
        };
        await graph.handlerRegistry
            ?.getHandler(GraphEvents.ON_RUN_STEP_COMPLETED)
            ?.handle(GraphEvents.ON_RUN_STEP_COMPLETED, {
            result: {
                id: stepId,
                index: runStep.index,
                type: 'tool_call',
                tool_call,
            },
        }, metadata, graph);
    }
    /**
     * Instance method that delegates to the static method
     * Kept for backward compatibility
     */
    async handleToolCallError(data, metadata) {
        await StandardGraph.handleToolCallErrorStatic(this, data, metadata);
    }
    async dispatchRunStepDelta(id, delta) {
        if (!this.config) {
            throw new Error('No config provided');
        }
        else if (!id) {
            throw new Error('No step ID found');
        }
        const runStepDelta = {
            id,
            delta,
        };
        await safeDispatchCustomEvent(GraphEvents.ON_RUN_STEP_DELTA, runStepDelta, this.config);
    }
    async dispatchMessageDelta(id, delta) {
        if (!this.config) {
            throw new Error('No config provided');
        }
        const messageDelta = {
            id,
            delta,
        };
        await safeDispatchCustomEvent(GraphEvents.ON_MESSAGE_DELTA, messageDelta, this.config);
    }
    dispatchReasoningDelta = async (stepId, delta) => {
        if (!this.config) {
            throw new Error('No config provided');
        }
        const reasoningDelta = {
            id: stepId,
            delta,
        };
        await safeDispatchCustomEvent(GraphEvents.ON_REASONING_DELTA, reasoningDelta, this.config);
    };
}

export { Graph, StandardGraph };
//# sourceMappingURL=Graph.mjs.map
