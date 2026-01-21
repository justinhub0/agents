import { CallbackManagerForChainRun } from '@langchain/core/callbacks/manager';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';
/**
 * Delays the execution for a specified number of milliseconds.
 *
 * @param {number} ms - The number of milliseconds to delay.
 * @return {Promise<void>} A promise that resolves after the specified delay.
 */
export declare function sleep(ms: number): Promise<void>;
export interface RunnableCallableArgs extends Partial<any> {
    name?: string;
    func: (...args: any[]) => any;
    tags?: string[];
    trace?: boolean;
    recurse?: boolean;
}
export declare class RunnableCallable<I = unknown, O = unknown> extends Runnable<I, O> {
    lc_namespace: string[];
    func: (...args: any[]) => any;
    tags?: string[];
    config?: RunnableConfig;
    trace: boolean;
    recurse: boolean;
    constructor(fields: RunnableCallableArgs);
    protected _tracedInvoke(input: I, config?: Partial<RunnableConfig>, runManager?: CallbackManagerForChainRun): Promise<O>;
    invoke(input: any, options?: Partial<RunnableConfig> | undefined): Promise<any>;
}
