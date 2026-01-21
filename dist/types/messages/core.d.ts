import { AIMessageChunk, HumanMessage, ToolMessage, AIMessage, BaseMessage } from '@langchain/core/messages';
import type * as t from '@/types';
import { Providers } from '@/common';
export declare function getConverseOverrideMessage({ userMessage, lastMessageX, lastMessageY, }: {
    userMessage: string[];
    lastMessageX: AIMessageChunk | null;
    lastMessageY: ToolMessage;
}): HumanMessage;
export declare function modifyDeltaProperties(provider: Providers, obj?: AIMessageChunk): AIMessageChunk | undefined;
export declare function formatAnthropicMessage(message: AIMessageChunk): AIMessage;
export declare function convertMessagesToContent(messages: BaseMessage[]): t.MessageContentComplex[];
export declare function formatAnthropicArtifactContent(messages: BaseMessage[]): void;
export declare function formatArtifactPayload(messages: BaseMessage[]): void;
export declare function findLastIndex<T>(array: T[], predicate: (value: T) => boolean): number;
