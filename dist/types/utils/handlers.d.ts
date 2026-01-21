/**
 * Multi-Agent Handler Utilities
 *
 * Provides a simple helper to create handlers with content aggregation for multi-agent scripts.
 *
 * Usage:
 * ```typescript
 * const { contentParts, aggregateContent, handlers } = createHandlers();
 *
 * // With callbacks
 * const { contentParts, aggregateContent, handlers } = createHandlers({
 *   onRunStep: (event, data) => console.log('Step:', data),
 *   onRunStepCompleted: (event, data) => console.log('Completed:', data)
 * });
 * ```
 */
import { GraphEvents } from '@/common';
import { createContentAggregator } from '@/stream';
import type * as t from '@/types';
interface HandlerCallbacks {
    onRunStep?: (event: GraphEvents.ON_RUN_STEP, data: t.StreamEventData) => void;
    onRunStepCompleted?: (event: GraphEvents.ON_RUN_STEP_COMPLETED, data: t.StreamEventData) => void;
    onRunStepDelta?: (event: GraphEvents.ON_RUN_STEP_DELTA, data: t.StreamEventData) => void;
    onMessageDelta?: (event: GraphEvents.ON_MESSAGE_DELTA, data: t.StreamEventData) => void;
}
/**
 * Creates handlers with content aggregation for multi-agent scripts
 */
export declare function createHandlers(callbacks?: HandlerCallbacks): {
    contentParts: Array<t.MessageContentComplex | undefined>;
    aggregateContent: ReturnType<typeof createContentAggregator>['aggregateContent'];
    handlers: Record<string, t.EventHandler>;
};
export {};
