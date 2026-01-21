import './instrumentation';
import type { MessageContentComplex, BaseMessage } from '@langchain/core/messages';
import type { RunnableConfig } from '@langchain/core/runnables';
import type * as t from '@/types';
import { MultiAgentGraph } from '@/graphs/MultiAgentGraph';
import { StandardGraph } from '@/graphs/Graph';
export declare const defaultOmitOptions: Set<string>;
export declare class Run<_T extends t.BaseGraphState> {
    id: string;
    private tokenCounter?;
    private handlerRegistry?;
    private indexTokenCountMap?;
    graphRunnable?: t.CompiledStateWorkflow;
    Graph: StandardGraph | MultiAgentGraph | undefined;
    returnContent: boolean;
    private constructor();
    private createLegacyGraph;
    private createMultiAgentGraph;
    static create<T extends t.BaseGraphState>(config: t.RunConfig): Promise<Run<T>>;
    getRunMessages(): BaseMessage[] | undefined;
    /**
     * Creates a custom event callback handler that intercepts custom events
     * and processes them through our handler registry instead of EventStreamCallbackHandler
     */
    private createCustomEventCallback;
    processStream(inputs: t.IState, config: Partial<RunnableConfig> & {
        version: 'v1' | 'v2';
        run_id?: string;
    }, streamOptions?: t.EventStreamOptions): Promise<MessageContentComplex[] | undefined>;
    private createSystemCallback;
    getCallbacks(clientCallbacks: t.ClientCallbacks): t.SystemCallbacks;
    generateTitle({ provider, inputText, contentParts, titlePrompt, clientOptions, chainOptions, skipLanguage, titleMethod, titlePromptTemplate, }: t.RunTitleOptions): Promise<{
        language?: string;
        title?: string;
    }>;
}
