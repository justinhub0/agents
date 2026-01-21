import type { BaseMessage } from '@langchain/core/messages';
/**
 * Formats an array of messages for LangChain, making sure all content fields are strings
 * @param {Array<HumanMessage | AIMessage | SystemMessage | ToolMessage>} payload - The array of messages to format.
 * @returns {Array<HumanMessage | AIMessage | SystemMessage | ToolMessage>} - The array of formatted LangChain messages, including ToolMessages for tool calls.
 */
export declare const formatContentStrings: (payload: Array<BaseMessage>) => Array<BaseMessage>;
