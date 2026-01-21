import { AIMessage, ToolMessage, BaseMessage, HumanMessage, SystemMessage } from '@langchain/core/messages';
import type { MessageContentImageUrl } from '@langchain/core/messages';
import type { MessageContentComplex, TPayload } from '@/types';
import { Providers } from '@/common';
interface MediaMessageParams {
    message: {
        role: string;
        content: string;
        name?: string;
        [key: string]: any;
    };
    mediaParts: MessageContentComplex[];
    endpoint?: Providers;
}
/**
 * Formats a message with media content (images, documents, videos, audios) to API payload format.
 *
 * @param params - The parameters for formatting.
 * @returns - The formatted message.
 */
export declare const formatMediaMessage: ({ message, endpoint, mediaParts, }: MediaMessageParams) => {
    role: string;
    content: MessageContentComplex[];
    name?: string;
    [key: string]: any;
};
interface MessageInput {
    role?: string;
    _name?: string;
    sender?: string;
    text?: string;
    content?: string | MessageContentComplex[];
    image_urls?: MessageContentImageUrl[];
    documents?: MessageContentComplex[];
    videos?: MessageContentComplex[];
    audios?: MessageContentComplex[];
    lc_id?: string[];
    [key: string]: any;
}
interface FormatMessageParams {
    message: MessageInput;
    userName?: string;
    assistantName?: string;
    endpoint?: Providers;
    langChain?: boolean;
}
interface FormattedMessage {
    role: string;
    content: string | MessageContentComplex[];
    name?: string;
    [key: string]: any;
}
/**
 * Formats a message to OpenAI payload format based on the provided options.
 *
 * @param params - The parameters for formatting.
 * @returns - The formatted message.
 */
export declare const formatMessage: ({ message, userName, endpoint, assistantName, langChain, }: FormatMessageParams) => FormattedMessage | HumanMessage | AIMessage | SystemMessage;
/**
 * Formats an array of messages for LangChain.
 *
 * @param messages - The array of messages to format.
 * @param formatOptions - The options for formatting each message.
 * @returns - The array of formatted LangChain messages.
 */
export declare const formatLangChainMessages: (messages: Array<MessageInput>, formatOptions: Omit<FormatMessageParams, "message" | "langChain">) => Array<HumanMessage | AIMessage | SystemMessage>;
interface LangChainMessage {
    lc_kwargs?: {
        additional_kwargs?: Record<string, any>;
        [key: string]: any;
    };
    kwargs?: {
        additional_kwargs?: Record<string, any>;
        [key: string]: any;
    };
    [key: string]: any;
}
/**
 * Formats a LangChain message object by merging properties from `lc_kwargs` or `kwargs` and `additional_kwargs`.
 *
 * @param message - The message object to format.
 * @returns - The formatted LangChain message.
 */
export declare const formatFromLangChain: (message: LangChainMessage) => Record<string, any>;
/**
 * Groups content parts by agent and formats them with agent labels
 * This preprocesses multi-agent content to prevent identity confusion
 *
 * @param contentParts - The content parts from a run
 * @param agentIdMap - Map of content part index to agent ID
 * @param agentNames - Optional map of agent ID to display name
 * @param options - Configuration options
 * @param options.labelNonTransferContent - If true, labels all agent transitions (for parallel patterns)
 * @returns Modified content parts with agent labels where appropriate
 */
export declare const labelContentByAgent: (contentParts: MessageContentComplex[], agentIdMap?: Record<number, string>, agentNames?: Record<string, string>, options?: {
    labelNonTransferContent?: boolean;
}) => MessageContentComplex[];
/**
 * Formats an array of messages for LangChain, handling tool calls and creating ToolMessage instances.
 *
 * @param payload - The array of messages to format.
 * @param indexTokenCountMap - Optional map of message indices to token counts.
 * @param tools - Optional set of tool names that are allowed in the request.
 * @returns - Object containing formatted messages and updated indexTokenCountMap if provided.
 */
export declare const formatAgentMessages: (payload: TPayload, indexTokenCountMap?: Record<number, number | undefined>, tools?: Set<string>) => {
    messages: Array<HumanMessage | AIMessage | SystemMessage | ToolMessage>;
    indexTokenCountMap?: Record<number, number>;
};
/**
 * Adds a value at key 0 for system messages and shifts all key indices by one in an indexTokenCountMap.
 * This is useful when adding a system message at the beginning of a conversation.
 *
 * @param indexTokenCountMap - The original map of message indices to token counts
 * @param instructionsTokenCount - The token count for the system message to add at index 0
 * @returns A new map with the system message at index 0 and all other indices shifted by 1
 */
export declare function shiftIndexTokenCountMap(indexTokenCountMap: Record<number, number>, instructionsTokenCount: number): Record<number, number>;
/**
 * Ensures compatibility when switching from a non-thinking agent to a thinking-enabled agent.
 * Converts AI messages with tool calls (that lack thinking/reasoning blocks) into buffer strings,
 * avoiding the thinking block signature requirement.
 *
 * Recognizes the following as valid thinking/reasoning blocks:
 * - ContentTypes.THINKING (Anthropic)
 * - ContentTypes.REASONING_CONTENT (Bedrock)
 * - ContentTypes.REASONING (VertexAI / Google)
 * - 'redacted_thinking'
 *
 * @param messages - Array of messages to process
 * @param provider - The provider being used (unused but kept for future compatibility)
 * @returns The messages array with tool sequences converted to buffer strings if necessary
 */
export declare function ensureThinkingBlockInMessages(messages: BaseMessage[], _provider: Providers): BaseMessage[];
export {};
