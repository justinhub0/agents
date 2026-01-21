import { ChatGenerationChunk } from '@langchain/core/outputs';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import type { GenerateContentRequest } from '@google/generative-ai';
import type { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager';
import type { BaseMessage } from '@langchain/core/messages';
import type { GeminiGenerationConfig } from '@langchain/google-common';
import type { GoogleClientOptions } from '@/types';
export declare class CustomChatGoogleGenerativeAI extends ChatGoogleGenerativeAI {
    thinkingConfig?: GeminiGenerationConfig['thinkingConfig'];
    /**
     * Override to add gemini-3 model support for multimodal and function calling thought signatures
     */
    get _isMultimodalModel(): boolean;
    constructor(fields: GoogleClientOptions);
    static lc_name(): 'LibreChatGoogleGenerativeAI';
    /**
     * Helper function to convert Gemini API usage metadata to LangChain format
     * Includes support for cached tokens and tier-based tracking for gemini-3-pro-preview
     */
    private _convertToUsageMetadata;
    invocationParams(options?: this['ParsedCallOptions']): Omit<GenerateContentRequest, 'contents'>;
    _generate(messages: BaseMessage[], options: this['ParsedCallOptions'], runManager?: CallbackManagerForLLMRun): Promise<import('@langchain/core/outputs').ChatResult>;
    _streamResponseChunks(messages: BaseMessage[], options: this['ParsedCallOptions'], runManager?: CallbackManagerForLLMRun): AsyncGenerator<ChatGenerationChunk>;
}
