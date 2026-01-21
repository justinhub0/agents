import type { BaseMessage } from '@langchain/core/messages';
/**
 * Extracts discovered tool names from tool search results in the current turn.
 * Only processes tool search messages after the latest AI message with tool calls.
 *
 * Similar pattern to formatArtifactPayload - finds relevant messages efficiently
 * by identifying the latest AI parent and only processing subsequent tool messages.
 *
 * @param messages - All messages in the conversation
 * @returns Array of discovered tool names (empty if no new discoveries)
 */
export declare function extractToolDiscoveries(messages: BaseMessage[]): string[];
/**
 * Checks if the current turn has any tool search results.
 * Quick check to avoid full extraction when not needed.
 */
export declare function hasToolSearchInCurrentTurn(messages: BaseMessage[]): boolean;
