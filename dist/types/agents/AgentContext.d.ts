import { SystemMessage } from '@langchain/core/messages';
import type { UsageMetadata, BaseMessage } from '@langchain/core/messages';
import type { RunnableConfig, Runnable } from '@langchain/core/runnables';
import type * as t from '@/types';
import type { createPruneMessages } from '@/messages';
import type { CompactionConfig } from '@/types/graph';
import { ContentTypes, Providers } from '@/common';
/**
 * Encapsulates agent-specific state that can vary between agents in a multi-agent system
 */
export declare class AgentContext {
    /**
     * Create an AgentContext from configuration with token accounting initialization
     */
    static fromConfig(agentConfig: t.AgentInputs, tokenCounter?: t.TokenCounter, indexTokenCountMap?: Record<string, number>): AgentContext;
    /** Agent identifier */
    agentId: string;
    /** Human-readable name for this agent (used in handoff context). Falls back to agentId if not provided. */
    name?: string;
    /** Provider for this specific agent */
    provider: Providers;
    /** Client options for this agent */
    clientOptions?: t.ClientOptions;
    /** Token count map indexed by message position */
    indexTokenCountMap: Record<string, number | undefined>;
    /** Maximum context tokens for this agent */
    maxContextTokens?: number;
    /** Current usage metadata for this agent */
    currentUsage?: Partial<UsageMetadata>;
    /** Prune messages function configured for this agent */
    pruneMessages?: ReturnType<typeof createPruneMessages>;
    /** Token counter function for this agent */
    tokenCounter?: t.TokenCounter;
    /** Instructions/system message token count */
    instructionTokens: number;
    /** The amount of time that should pass before another consecutive API call */
    streamBuffer?: number;
    /** Last stream call timestamp for rate limiting */
    lastStreamCall?: number;
    /** Tools available to this agent */
    tools?: t.GraphTools;
    /** Tool map for this agent */
    toolMap?: t.ToolMap;
    /**
     * Tool definitions registry (includes deferred and programmatic tool metadata).
     * Used for tool search and programmatic tool calling.
     */
    toolRegistry?: t.LCToolRegistry;
    /** Set of tool names discovered via tool search (to be loaded) */
    discoveredToolNames: Set<string>;
    /** Instructions for this agent */
    instructions?: string;
    /** Additional instructions for this agent */
    additionalInstructions?: string;
    /** Reasoning key for this agent */
    reasoningKey: 'reasoning_content' | 'reasoning';
    /** Last token for reasoning detection */
    lastToken?: string;
    /** Token type switch state */
    tokenTypeSwitch?: 'reasoning' | 'content';
    /** Current token type being processed */
    currentTokenType: ContentTypes.TEXT | ContentTypes.THINK | 'think_and_text';
    /** Whether tools should end the workflow */
    toolEnd: boolean;
    /** Cached system runnable (created lazily) */
    private cachedSystemRunnable?;
    /** Whether system runnable needs rebuild (set when discovered tools change) */
    private systemRunnableStale;
    /** Cached system message token count (separate from tool tokens) */
    private systemMessageTokens;
    /** Promise for token calculation initialization */
    tokenCalculationPromise?: Promise<void>;
    /** Format content blocks as strings (for legacy compatibility) */
    useLegacyContent: boolean;
    /**
     * Handoff context when this agent receives control via handoff.
     * Contains source and parallel execution info for system message context.
     */
    handoffContext?: {
        /** Source agent that transferred control */
        sourceAgentName: string;
        /** Names of sibling agents executing in parallel (empty if sequential) */
        parallelSiblings: string[];
    };
    /**
     * Compaction configuration for managing context limits during agent execution.
     */
    compaction?: CompactionConfig;
    constructor({ agentId, name, provider, clientOptions, maxContextTokens, streamBuffer, tokenCounter, tools, toolMap, toolRegistry, instructions, additionalInstructions, reasoningKey, toolEnd, instructionTokens, useLegacyContent, compaction, }: {
        agentId: string;
        name?: string;
        provider: Providers;
        clientOptions?: t.ClientOptions;
        maxContextTokens?: number;
        streamBuffer?: number;
        tokenCounter?: t.TokenCounter;
        tools?: t.GraphTools;
        toolMap?: t.ToolMap;
        toolRegistry?: t.LCToolRegistry;
        instructions?: string;
        additionalInstructions?: string;
        reasoningKey?: 'reasoning_content' | 'reasoning';
        toolEnd?: boolean;
        instructionTokens?: number;
        useLegacyContent?: boolean;
        compaction?: CompactionConfig;
    });
    /**
     * Builds instructions text for tools that are ONLY callable via programmatic code execution.
     * These tools cannot be called directly by the LLM but are available through the
     * run_tools_with_code tool.
     *
     * Includes:
     * - Code_execution-only tools that are NOT deferred
     * - Code_execution-only tools that ARE deferred but have been discovered via tool search
     */
    private buildProgrammaticOnlyToolsInstructions;
    /**
     * Gets the system runnable, creating it lazily if needed.
     * Includes instructions, additional instructions, and programmatic-only tools documentation.
     * Only rebuilds when marked stale (via markToolsAsDiscovered).
     */
    get systemRunnable(): Runnable<BaseMessage[], (BaseMessage | SystemMessage)[], RunnableConfig<Record<string, unknown>>> | undefined;
    /**
     * Explicitly initializes the system runnable.
     * Call this before async token calculation to ensure system message tokens are counted first.
     */
    initializeSystemRunnable(): void;
    /**
     * Builds the raw instructions string (without creating SystemMessage).
     * Includes agent identity preamble and handoff context when available.
     */
    private buildInstructionsString;
    /**
     * Builds the agent identity preamble including handoff context if present.
     * This helps the agent understand its role in the multi-agent workflow.
     */
    private buildIdentityPreamble;
    /**
     * Build system runnable from pre-built instructions string.
     * Only called when content has actually changed.
     */
    private buildSystemRunnable;
    /**
     * Reset context for a new run
     */
    reset(): void;
    /**
     * Update the token count map with instruction tokens
     */
    updateTokenMapWithInstructions(baseTokenMap: Record<string, number>): void;
    /**
     * Calculate tool tokens and add to instruction tokens
     * Note: System message tokens are calculated during systemRunnable creation
     */
    calculateInstructionTokens(tokenCounter: t.TokenCounter): Promise<void>;
    /**
     * Gets the tool registry for deferred tools (for tool search).
     * @param onlyDeferred If true, only returns tools with defer_loading=true
     * @returns LCToolRegistry with tool definitions
     */
    getDeferredToolRegistry(onlyDeferred?: boolean): t.LCToolRegistry;
    /**
     * Sets the handoff context for this agent.
     * Call this when the agent receives control via handoff from another agent.
     * Marks system runnable as stale to include handoff context in system message.
     * @param sourceAgentName - Name of the agent that transferred control
     * @param parallelSiblings - Names of other agents executing in parallel with this one
     */
    setHandoffContext(sourceAgentName: string, parallelSiblings: string[]): void;
    /**
     * Clears any handoff context.
     * Call this when resetting the agent or when handoff context is no longer relevant.
     */
    clearHandoffContext(): void;
    /**
     * Marks tools as discovered via tool search.
     * Discovered tools will be included in the next model binding.
     * Only marks system runnable stale if NEW tools were actually added.
     * @param toolNames - Array of discovered tool names
     * @returns true if any new tools were discovered
     */
    markToolsAsDiscovered(toolNames: string[]): boolean;
    /**
     * Gets tools that should be bound to the LLM.
     * Includes:
     * 1. Non-deferred tools with allowed_callers: ['direct']
     * 2. Discovered tools (from tool search)
     * @returns Array of tools to bind to model
     */
    getToolsForBinding(): t.GraphTools | undefined;
}
