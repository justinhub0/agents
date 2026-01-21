import { BaseMessage, UsageMetadata } from '@langchain/core/messages';
import type { TokenCounter } from '@/types/run';
import { ContentTypes, Providers } from '@/common';
export type PruneMessagesFactoryParams = {
    provider?: Providers;
    maxTokens: number;
    startIndex: number;
    tokenCounter: TokenCounter;
    indexTokenCountMap: Record<string, number | undefined>;
    thinkingEnabled?: boolean;
};
export type PruneMessagesParams = {
    messages: BaseMessage[];
    usageMetadata?: Partial<UsageMetadata>;
    startType?: ReturnType<BaseMessage['getType']>;
};
/**
 * Calculates the total tokens from a single usage object
 *
 * @param usage The usage metadata object containing token information
 * @returns An object containing the total input and output tokens
 */
export declare function calculateTotalTokens(usage: Partial<UsageMetadata>): UsageMetadata;
export type PruningResult = {
    context: BaseMessage[];
    remainingContextTokens: number;
    messagesToRefine: BaseMessage[];
    thinkingStartIndex?: number;
};
/**
 * Processes an array of messages and returns a context of messages that fit within a specified token limit.
 * It iterates over the messages from newest to oldest, adding them to the context until the token limit is reached.
 *
 * @param options Configuration options for processing messages
 * @returns Object containing the message context, remaining tokens, messages not included, and summary index
 */
export declare function getMessagesWithinTokenLimit({ messages: _messages, maxContextTokens, indexTokenCountMap, startType: _startType, thinkingEnabled, tokenCounter, thinkingStartIndex: _thinkingStartIndex, reasoningType, }: {
    messages: BaseMessage[];
    maxContextTokens: number;
    indexTokenCountMap: Record<string, number | undefined>;
    startType?: string | string[];
    thinkingEnabled?: boolean;
    tokenCounter: TokenCounter;
    thinkingStartIndex?: number;
    reasoningType?: ContentTypes.THINKING | ContentTypes.REASONING_CONTENT;
}): PruningResult;
export declare function checkValidNumber(value: unknown): value is number;
export declare function createPruneMessages(factoryParams: PruneMessagesFactoryParams): (params: PruneMessagesParams) => {
    context: BaseMessage[];
    indexTokenCountMap: Record<string, number | undefined>;
};
