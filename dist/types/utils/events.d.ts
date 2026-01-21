import type { RunnableConfig } from '@langchain/core/runnables';
/**
 * Safely dispatches a custom event and properly awaits it to avoid
 * race conditions where events are dispatched after run cleanup.
 */
export declare function safeDispatchCustomEvent(event: string, payload: unknown, config?: RunnableConfig): Promise<void>;
