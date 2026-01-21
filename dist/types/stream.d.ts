import type { AIMessageChunk } from '@langchain/core/messages';
import type { AgentContext } from '@/agents/AgentContext';
import type { StandardGraph } from '@/graphs';
import type * as t from '@/types';
import { Providers } from '@/common';
export declare function getChunkContent({ chunk, provider, reasoningKey, }: {
    chunk?: Partial<AIMessageChunk>;
    provider?: Providers;
    reasoningKey: 'reasoning_content' | 'reasoning';
}): string | t.MessageContentComplex[] | undefined;
export declare class ChatModelStreamHandler implements t.EventHandler {
    handle(event: string, data: t.StreamEventData, metadata?: Record<string, unknown>, graph?: StandardGraph): Promise<void>;
    handleReasoning(chunk: Partial<AIMessageChunk>, agentContext: AgentContext): void;
}
export declare function createContentAggregator(): t.ContentAggregatorResult;
