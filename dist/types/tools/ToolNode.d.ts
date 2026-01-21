import { ToolCall } from '@langchain/core/messages/tool';
import { END, Command, MessagesAnnotation } from '@langchain/langgraph';
import type { RunnableConfig } from '@langchain/core/runnables';
import type { BaseMessage } from '@langchain/core/messages';
import type * as t from '@/types';
import { RunnableCallable } from '@/utils';
export declare class ToolNode<T = any> extends RunnableCallable<T, T> {
    private toolMap;
    private loadRuntimeTools?;
    handleToolErrors: boolean;
    trace: boolean;
    toolCallStepIds?: Map<string, string>;
    errorHandler?: t.ToolNodeConstructorParams['errorHandler'];
    private toolUsageCount;
    /** Tool registry for filtering (lazy computation of programmatic maps) */
    private toolRegistry?;
    /** Cached programmatic tools (computed once on first PTC call) */
    private programmaticCache?;
    /** Reference to Graph's sessions map for automatic session injection */
    private sessions?;
    constructor({ tools, toolMap, name, tags, errorHandler, toolCallStepIds, handleToolErrors, loadRuntimeTools, toolRegistry, sessions, }: t.ToolNodeConstructorParams);
    /**
     * Returns cached programmatic tools, computing once on first access.
     * Single iteration builds both toolMap and toolDefs simultaneously.
     */
    private getProgrammaticTools;
    /**
     * Returns a snapshot of the current tool usage counts.
     * @returns A ReadonlyMap where keys are tool names and values are their usage counts.
     */
    getToolUsageCounts(): ReadonlyMap<string, number>;
    /**
     * Runs a single tool call with error handling
     */
    protected runTool(call: ToolCall, config: RunnableConfig): Promise<BaseMessage | Command>;
    protected run(input: any, config: RunnableConfig): Promise<T>;
    private isSendInput;
    private isMessagesState;
}
export declare function toolsCondition<T extends string>(state: BaseMessage[] | typeof MessagesAnnotation.State, toolNode: T, invokedToolIds?: Set<string>): T | typeof END;
