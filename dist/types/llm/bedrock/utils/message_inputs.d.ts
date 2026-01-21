/**
 * Utility functions for converting LangChain messages to Bedrock Converse messages.
 * Ported from @langchain/aws common.js
 */
import { type BaseMessage, MessageContentComplex } from '@langchain/core/messages';
import type { BedrockMessage, BedrockSystemContentBlock, BedrockContentBlock, MessageContentReasoningBlock } from '../types';
/**
 * Convert a LangChain reasoning block to a Bedrock reasoning block.
 */
export declare function langchainReasoningBlockToBedrockReasoningBlock(content: MessageContentReasoningBlock): {
    reasoningText?: {
        text?: string;
        signature?: string;
    };
    redactedContent?: Uint8Array;
};
/**
 * Concatenate consecutive reasoning blocks in content array.
 */
export declare function concatenateLangchainReasoningBlocks(content: Array<MessageContentComplex | MessageContentReasoningBlock>): Array<MessageContentComplex | MessageContentReasoningBlock>;
/**
 * Extract image info from a base64 string or URL.
 */
export declare function extractImageInfo(base64: string): BedrockContentBlock;
/**
 * Convert LangChain messages to Bedrock Converse messages.
 */
export declare function convertToConverseMessages(messages: BaseMessage[]): {
    converseMessages: BedrockMessage[];
    converseSystem: BedrockSystemContentBlock[];
};
