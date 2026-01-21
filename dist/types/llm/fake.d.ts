import { ChatGenerationChunk } from '@langchain/core/outputs';
import type { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager';
import type { BaseMessage } from '@langchain/core/messages';
import { FakeListChatModel } from '@langchain/core/utils/testing';
import { ToolCall, ToolCallChunk } from '@langchain/core/messages/tool';
type SplitStrategy = {
    type: 'regex' | 'fixed';
    value: RegExp | number;
};
export declare class FakeChatModel extends FakeListChatModel {
    private splitStrategy;
    private toolCalls;
    private addedToolCalls;
    constructor({ responses, sleep, emitCustomEvent, splitStrategy, toolCalls }: {
        responses: string[];
        sleep?: number;
        emitCustomEvent?: boolean;
        splitStrategy?: SplitStrategy;
        toolCalls?: ToolCall[];
    });
    private splitText;
    _createResponseChunk(text: string, tool_call_chunks?: ToolCallChunk[]): ChatGenerationChunk;
    _streamResponseChunks(_messages: BaseMessage[], options: this['ParsedCallOptions'], runManager?: CallbackManagerForLLMRun): AsyncGenerator<ChatGenerationChunk>;
}
export declare function createFakeStreamingLLM({ responses, sleep, splitStrategy, toolCalls, }: {
    responses: string[];
    sleep?: number;
    splitStrategy?: SplitStrategy;
    toolCalls?: ToolCall[];
}): FakeChatModel;
export {};
