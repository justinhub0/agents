import { ChatOpenAI } from '@/llm/openai';
import { ChatGenerationChunk } from '@langchain/core/outputs';
import { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager';
import type { FunctionMessageChunk, SystemMessageChunk, HumanMessageChunk, ToolMessageChunk, ChatMessageChunk, AIMessageChunk, BaseMessage } from '@langchain/core/messages';
import type { ChatOpenAICallOptions, OpenAIChatInput, OpenAIClient } from '@langchain/openai';
export interface ChatOpenRouterCallOptions extends ChatOpenAICallOptions {
    include_reasoning?: boolean;
    modelKwargs?: OpenAIChatInput['modelKwargs'];
}
export declare class ChatOpenRouter extends ChatOpenAI {
    constructor(_fields: Partial<ChatOpenRouterCallOptions>);
    static lc_name(): 'LibreChatOpenRouter';
    protected _convertOpenAIDeltaToBaseMessageChunk(delta: Record<string, any>, rawResponse: OpenAIClient.ChatCompletionChunk, defaultRole?: 'function' | 'user' | 'system' | 'developer' | 'assistant' | 'tool'): AIMessageChunk | HumanMessageChunk | SystemMessageChunk | FunctionMessageChunk | ToolMessageChunk | ChatMessageChunk;
    _streamResponseChunks2(messages: BaseMessage[], options: this['ParsedCallOptions'], runManager?: CallbackManagerForLLMRun): AsyncGenerator<ChatGenerationChunk>;
}
