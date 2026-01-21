import { AzureOpenAI as AzureOpenAIClient } from 'openai';
import { ChatXAI as OriginalChatXAI } from '@langchain/xai';
import { ChatGenerationChunk } from '@langchain/core/outputs';
import { ChatDeepSeek as OriginalChatDeepSeek } from '@langchain/deepseek';
import { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager';
import { OpenAIClient, ChatOpenAI as OriginalChatOpenAI, AzureChatOpenAI as OriginalAzureChatOpenAI } from '@langchain/openai';
import type { HeaderValue, HeadersLike } from './types';
import type { BindToolsInput } from '@langchain/core/language_models/chat_models';
import type { BaseMessage } from '@langchain/core/messages';
import type { ChatXAIInput } from '@langchain/xai';
import type * as t from '@langchain/openai';
export declare function isHeaders(headers: unknown): headers is Headers;
export declare function normalizeHeaders(headers: HeadersLike): Record<string, HeaderValue | readonly HeaderValue[]>;
type OpenAICoreRequestOptions = OpenAIClient.RequestOptions;
/**
 * Formats a tool in either OpenAI format, or LangChain structured tool format
 * into an OpenAI tool format. If the tool is already in OpenAI format, return without
 * any changes. If it is in LangChain structured tool format, convert it to OpenAI tool format
 * using OpenAI's `zodFunction` util, falling back to `convertToOpenAIFunction` if the parameters
 * returned from the `zodFunction` util are not defined.
 *
 * @param {BindToolsInput} tool The tool to convert to an OpenAI tool.
 * @param {Object} [fields] Additional fields to add to the OpenAI tool.
 * @returns {ToolDefinition} The inputted tool in OpenAI tool format.
 */
export declare function _convertToOpenAITool(tool: BindToolsInput, fields?: {
    /**
     * If `true`, model output is guaranteed to exactly match the JSON Schema
     * provided in the function definition.
     */
    strict?: boolean;
}): OpenAIClient.ChatCompletionTool;
export declare class CustomOpenAIClient extends OpenAIClient {
    abortHandler?: () => void;
    fetchWithTimeout(url: RequestInfo, init: RequestInit | undefined, ms: number, controller: AbortController): Promise<Response>;
}
export declare class CustomAzureOpenAIClient extends AzureOpenAIClient {
    abortHandler?: () => void;
    fetchWithTimeout(url: RequestInfo, init: RequestInit | undefined, ms: number, controller: AbortController): Promise<Response>;
}
/** @ts-expect-error We are intentionally overriding `getReasoningParams` */
export declare class ChatOpenAI extends OriginalChatOpenAI<t.ChatOpenAICallOptions> {
    _lc_stream_delay?: number;
    truncation?: 'auto' | 'disabled';
    constructor(fields?: t.ChatOpenAICallOptions & {
        _lc_stream_delay?: number;
        truncation?: 'auto' | 'disabled' | null;
    } & t.OpenAIChatInput['modelKwargs']);
    get exposedClient(): CustomOpenAIClient;
    static lc_name(): string;
    protected _getClientOptions(options?: OpenAICoreRequestOptions): OpenAICoreRequestOptions;
    /**
     * Returns backwards compatible reasoning parameters from constructor params and call options
     * @internal
     */
    getReasoningParams(options?: this['ParsedCallOptions']): OpenAIClient.Reasoning | undefined;
    protected _getReasoningParams(options?: this['ParsedCallOptions']): OpenAIClient.Reasoning | undefined;
    _streamResponseChunks(messages: BaseMessage[], options: this['ParsedCallOptions'], runManager?: CallbackManagerForLLMRun): AsyncGenerator<ChatGenerationChunk>;
    _streamResponseChunks2(messages: BaseMessage[], options: this['ParsedCallOptions'], runManager?: CallbackManagerForLLMRun): AsyncGenerator<ChatGenerationChunk>;
}
/** @ts-expect-error We are intentionally overriding `getReasoningParams` */
export declare class AzureChatOpenAI extends OriginalAzureChatOpenAI {
    _lc_stream_delay?: number;
    truncation?: 'auto' | 'disabled';
    constructor(fields?: t.AzureOpenAIInput & {
        _lc_stream_delay?: number;
        truncation?: 'auto' | 'disabled' | null;
    });
    get exposedClient(): CustomOpenAIClient;
    static lc_name(): 'LibreChatAzureOpenAI';
    /**
     * Returns backwards compatible reasoning parameters from constructor params and call options
     * @internal
     */
    getReasoningParams(options?: this['ParsedCallOptions']): OpenAIClient.Reasoning | undefined;
    protected _getReasoningParams(options?: this['ParsedCallOptions']): OpenAIClient.Reasoning | undefined;
    protected _getClientOptions(options: OpenAICoreRequestOptions | undefined): OpenAICoreRequestOptions;
    _streamResponseChunks(messages: BaseMessage[], options: this['ParsedCallOptions'], runManager?: CallbackManagerForLLMRun): AsyncGenerator<ChatGenerationChunk>;
}
export declare class ChatDeepSeek extends OriginalChatDeepSeek {
    get exposedClient(): CustomOpenAIClient;
    static lc_name(): 'LibreChatDeepSeek';
    protected _getClientOptions(options?: OpenAICoreRequestOptions): OpenAICoreRequestOptions;
    _streamResponseChunks(messages: BaseMessage[], options: this['ParsedCallOptions'], runManager?: CallbackManagerForLLMRun): AsyncGenerator<ChatGenerationChunk>;
}
/** xAI-specific usage metadata type */
export interface XAIUsageMetadata extends OpenAIClient.Completions.CompletionUsage {
    prompt_tokens_details?: {
        audio_tokens?: number;
        cached_tokens?: number;
        text_tokens?: number;
        image_tokens?: number;
    };
    completion_tokens_details?: {
        audio_tokens?: number;
        reasoning_tokens?: number;
        accepted_prediction_tokens?: number;
        rejected_prediction_tokens?: number;
    };
    num_sources_used?: number;
}
export declare class ChatXAI extends OriginalChatXAI {
    _lc_stream_delay?: number;
    constructor(fields?: Partial<ChatXAIInput> & {
        configuration?: {
            baseURL?: string;
        };
        clientConfig?: {
            baseURL?: string;
        };
        _lc_stream_delay?: number;
    });
    static lc_name(): 'LibreChatXAI';
    get exposedClient(): CustomOpenAIClient;
    protected _getClientOptions(options?: OpenAICoreRequestOptions): OpenAICoreRequestOptions;
    _streamResponseChunks(messages: BaseMessage[], options: this['ParsedCallOptions'], runManager?: CallbackManagerForLLMRun): AsyncGenerator<ChatGenerationChunk>;
}
export {};
