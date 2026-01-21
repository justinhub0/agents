import { BaseMessage, MessageContentComplex } from '@langchain/core/messages';
import type { AnthropicMessage } from '@/types/messages';
type MessageWithContent = {
    content?: string | MessageContentComplex[];
};
/**
 * Anthropic API: Adds cache control to the appropriate user messages in the payload.
 * Strips ALL existing cache control (both Anthropic and Bedrock formats) from all messages,
 * then adds fresh cache control to the last 2 user messages in a single backward pass.
 * This ensures we don't accumulate stale cache points across multiple turns.
 * Returns a new array - only clones messages that require modification.
 * @param messages - The array of message objects.
 * @returns - A new array of message objects with cache control added.
 */
export declare function addCacheControl<T extends AnthropicMessage | BaseMessage>(messages: T[]): T[];
/**
 * Removes all Anthropic cache_control fields from messages
 * Used when switching from Anthropic to Bedrock provider
 * Returns a new array - only clones messages that require modification.
 */
export declare function stripAnthropicCacheControl<T extends MessageWithContent>(messages: T[]): T[];
/**
 * Removes all Bedrock cachePoint blocks from messages
 * Used when switching from Bedrock to Anthropic provider
 * Returns a new array - only clones messages that require modification.
 */
export declare function stripBedrockCacheControl<T extends MessageWithContent>(messages: T[]): T[];
/**
 * Adds Bedrock Converse API cache points to the last two messages.
 * Inserts `{ cachePoint: { type: 'default' } }` as a separate content block
 * immediately after the last text block in each targeted message.
 * Strips ALL existing cache control (both Bedrock and Anthropic formats) from all messages,
 * then adds fresh cache points to the last 2 messages in a single backward pass.
 * This ensures we don't accumulate stale cache points across multiple turns.
 * Returns a new array - only clones messages that require modification.
 * @param messages - The array of message objects.
 * @returns - A new array of message objects with cache points added.
 */
export declare function addBedrockCacheControl<T extends Partial<BaseMessage> & MessageWithContent>(messages: T[]): T[];
export {};
