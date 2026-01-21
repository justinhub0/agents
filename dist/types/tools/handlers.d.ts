import type { ToolCall, ToolCallChunk } from '@langchain/core/messages/tool';
import type { MultiAgentGraph, StandardGraph } from '@/graphs';
import type { AgentContext } from '@/agents/AgentContext';
import type * as t from '@/types';
export declare function handleToolCallChunks({ graph, stepKey, toolCallChunks, metadata, }: {
    graph: StandardGraph | MultiAgentGraph;
    stepKey: string;
    toolCallChunks: ToolCallChunk[];
    metadata?: Record<string, unknown>;
}): Promise<void>;
export declare const handleToolCalls: (toolCalls?: ToolCall[], metadata?: Record<string, unknown>, graph?: StandardGraph | MultiAgentGraph) => Promise<void>;
export declare const toolResultTypes: Set<string>;
/**
 * Handles the result of a server tool call; in other words, a provider's built-in tool.
 * As of 2025-07-06, only Anthropic handles server tool calls with this pattern.
 */
export declare function handleServerToolResult({ graph, content, metadata, agentContext, }: {
    graph: StandardGraph | MultiAgentGraph;
    content?: string | t.MessageContentComplex[];
    metadata?: Record<string, unknown>;
    agentContext?: AgentContext;
}): Promise<boolean>;
