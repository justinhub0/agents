import type * as t from '@/types';
import { ContentTypes } from '@/common';
export declare const SEPARATORS: string[];
export declare class SplitStreamHandler {
    private inCodeBlock;
    private inThinkBlock;
    private accumulate;
    tokens: string[];
    lastToken: string;
    reasoningTokens: string[];
    currentStepId?: string;
    currentMessageId?: string;
    currentType?: ContentTypes.TEXT | ContentTypes.THINK;
    currentLength: number;
    reasoningKey: 'reasoning_content' | 'reasoning';
    currentIndex: number;
    blockThreshold: number;
    /** The run ID AKA the Message ID associated with the complete generation */
    runId: string;
    handlers?: t.SplitStreamHandlers;
    constructor({ runId, handlers, accumulate, reasoningKey, blockThreshold, }: {
        runId: string;
        accumulate?: boolean;
        handlers: t.SplitStreamHandlers;
        blockThreshold?: number;
        reasoningKey?: 'reasoning_content' | 'reasoning';
    });
    getMessageId: () => string | undefined;
    createMessageStep: (type?: ContentTypes.TEXT | ContentTypes.THINK) => [string, string];
    dispatchRunStep: (stepId: string, stepDetails: t.StepDetails) => void;
    dispatchMessageDelta: (stepId: string, delta: t.MessageDelta) => void;
    dispatchReasoningDelta: (stepId: string, delta: t.ReasoningDelta) => void;
    handleContent: (content: string, _type: ContentTypes.TEXT | ContentTypes.THINK) => void;
    getDeltaContent(chunk?: t.CustomChunk): string;
    getReasoningDelta(chunk?: t.CustomChunk): string;
    handle(chunk?: t.CustomChunk): void;
}
