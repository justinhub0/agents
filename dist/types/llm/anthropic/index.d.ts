import { ChatAnthropicMessages } from '@langchain/anthropic';
import { ChatGenerationChunk } from '@langchain/core/outputs';
import type { BaseChatModelParams } from '@langchain/core/language_models/chat_models';
import type { BaseMessage, UsageMetadata } from '@langchain/core/messages';
import type { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager';
import type { AnthropicInput } from '@langchain/anthropic';
import type { AnthropicMessageCreateParams, AnthropicStreamingMessageCreateParams } from '@/llm/anthropic/types';
export type CustomAnthropicInput = AnthropicInput & {
    _lc_stream_delay?: number;
} & BaseChatModelParams;
/**
 * A type representing additional parameters that can be passed to the
 * Anthropic API.
 */
type Kwargs = Record<string, any>;
export declare class CustomAnthropic extends ChatAnthropicMessages {
    _lc_stream_delay: number;
    private message_start;
    private message_delta;
    private tools_in_params?;
    private emitted_usage?;
    top_k: number | undefined;
    constructor(fields?: CustomAnthropicInput);
    static lc_name(): 'LibreChatAnthropic';
    /**
     * Get the parameters used to invoke the model
     */
    invocationParams(options?: this['ParsedCallOptions']): Omit<AnthropicMessageCreateParams | AnthropicStreamingMessageCreateParams, 'messages'> & Kwargs;
    /**
     * Get stream usage as returned by this client's API response.
     * @returns The stream usage object.
     */
    getStreamUsage(): UsageMetadata | undefined;
    resetTokenEvents(): void;
    setDirectFields(fields?: CustomAnthropicInput): void;
    private createGenerationChunk;
    _streamResponseChunks(messages: BaseMessage[], options: this['ParsedCallOptions'], runManager?: CallbackManagerForLLMRun): AsyncGenerator<ChatGenerationChunk>;
}
export {};
