import type { UsageMetadata, BaseMessageFields } from '@langchain/core/messages';
import type { MultiAgentGraph, StandardGraph } from '@/graphs';
import type { Logger } from 'winston';
import type * as t from '@/types';
export declare class HandlerRegistry {
    private handlers;
    register(eventType: string, handler: t.EventHandler): void;
    getHandler(eventType: string): t.EventHandler | undefined;
}
export declare class ModelEndHandler implements t.EventHandler {
    collectedUsage?: UsageMetadata[];
    constructor(collectedUsage?: UsageMetadata[]);
    handle(event: string, data: t.ModelEndData, metadata?: Record<string, unknown>, graph?: StandardGraph | MultiAgentGraph): Promise<void>;
}
export declare class ToolEndHandler implements t.EventHandler {
    private callback?;
    private logger?;
    private omitOutput?;
    constructor(callback?: t.ToolEndCallback, logger?: Logger, omitOutput?: (name?: string) => boolean);
    handle(event: string, data: t.StreamEventData | undefined, metadata?: Record<string, unknown>, graph?: StandardGraph | MultiAgentGraph): Promise<void>;
}
export declare class TestLLMStreamHandler implements t.EventHandler {
    handle(event: string, data: t.StreamEventData | undefined): void;
}
export declare class TestChatStreamHandler implements t.EventHandler {
    handle(event: string, data: t.StreamEventData | undefined): void;
}
export declare class LLMStreamHandler implements t.EventHandler {
    handle(event: string, data: t.StreamEventData | undefined, metadata?: Record<string, unknown>): void;
}
export declare const createMetadataAggregator: (_collected?: Record<string, NonNullable<BaseMessageFields["response_metadata"]>>[]) => t.MetadataAggregatorResult;
