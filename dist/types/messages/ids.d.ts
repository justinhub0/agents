import type { Graph } from '@/graphs';
import type * as t from '@/types';
export declare const getMessageId: (stepKey: string, graph: Graph<t.BaseGraphState>, returnExistingId?: boolean) => string | undefined;
