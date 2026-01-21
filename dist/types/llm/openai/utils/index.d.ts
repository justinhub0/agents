import { type OpenAI as OpenAIClient } from 'openai';
import { type BaseMessage } from '@langchain/core/messages';
import { ChatGenerationChunk } from '@langchain/core/outputs';
import type { OpenAICallOptions, OpenAIChatInput } from '@langchain/openai';
export type { OpenAICallOptions, OpenAIChatInput };
type ExtractAsyncIterableType<T> = T extends AsyncIterable<infer U> ? U : never;
type ExcludeNonController<T> = T extends {
    controller: unknown;
} ? T : never;
type ResponsesCreate = OpenAIClient.Responses['create'];
type ResponsesInputItem = OpenAIClient.Responses.ResponseInputItem;
type ResponsesCreateStream = ExcludeNonController<Awaited<ReturnType<ResponsesCreate>>>;
export type ResponseReturnStreamEvents = ExtractAsyncIterableType<ResponsesCreateStream>;
type OpenAIRoleEnum = 'system' | 'developer' | 'assistant' | 'user' | 'function' | 'tool';
type OpenAICompletionParam = OpenAIClient.Chat.Completions.ChatCompletionMessageParam;
export declare function messageToOpenAIRole(message: BaseMessage): OpenAIRoleEnum;
/** Options for converting messages to OpenAI params */
export interface ConvertMessagesOptions {
    /** Include reasoning_content field for DeepSeek thinking mode with tool calls */
    includeReasoningContent?: boolean;
    /** Include reasoning_details field for OpenRouter/Gemini thinking mode with tool calls */
    includeReasoningDetails?: boolean;
    /** Convert reasoning_details to content blocks for Claude (requires content array format) */
    convertReasoningDetailsToContent?: boolean;
}
export declare function _convertMessagesToOpenAIParams(messages: BaseMessage[], model?: string, options?: ConvertMessagesOptions): OpenAICompletionParam[];
export declare function _convertMessagesToOpenAIResponsesParams(messages: BaseMessage[], model?: string, zdrEnabled?: boolean): ResponsesInputItem[];
export declare function isReasoningModel(model?: string): boolean;
export declare function _convertOpenAIResponsesDeltaToBaseMessageChunk(chunk: ResponseReturnStreamEvents): ChatGenerationChunk | null;
