/**
 * Utility functions for converting Bedrock Converse responses to LangChain messages.
 * Ported from @langchain/aws common.js
 */
import { AIMessage } from '@langchain/core/messages';
import { ChatGenerationChunk } from '@langchain/core/outputs';
import type { BedrockMessage, ConverseResponse, ContentBlockDeltaEvent, ConverseStreamMetadataEvent, ContentBlockStartEvent, ReasoningContentBlock, ReasoningContentBlockDelta, MessageContentReasoningBlock, MessageContentReasoningBlockReasoningTextPartial, MessageContentReasoningBlockRedacted } from '../types';
/**
 * Convert a Bedrock reasoning block delta to a LangChain partial reasoning block.
 */
export declare function bedrockReasoningDeltaToLangchainPartialReasoningBlock(reasoningContent: ReasoningContentBlockDelta): MessageContentReasoningBlockReasoningTextPartial | MessageContentReasoningBlockRedacted;
/**
 * Convert a Bedrock reasoning block to a LangChain reasoning block.
 */
export declare function bedrockReasoningBlockToLangchainReasoningBlock(reasoningContent: ReasoningContentBlock): MessageContentReasoningBlock;
/**
 * Convert a Bedrock Converse message to a LangChain message.
 */
export declare function convertConverseMessageToLangChainMessage(message: BedrockMessage, responseMetadata: Omit<ConverseResponse, 'output'>): AIMessage;
/**
 * Handle a content block delta event from Bedrock Converse stream.
 */
export declare function handleConverseStreamContentBlockDelta(contentBlockDelta: ContentBlockDeltaEvent): ChatGenerationChunk;
/**
 * Handle a content block start event from Bedrock Converse stream.
 */
export declare function handleConverseStreamContentBlockStart(contentBlockStart: ContentBlockStartEvent): ChatGenerationChunk | null;
/**
 * Handle a metadata event from Bedrock Converse stream.
 */
export declare function handleConverseStreamMetadata(metadata: ConverseStreamMetadataEvent, extra: {
    streamUsage: boolean;
}): ChatGenerationChunk;
