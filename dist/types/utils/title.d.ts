import type { Runnable } from '@langchain/core/runnables';
import type * as t from '@/types';
export declare const createTitleRunnable: (model: t.ChatModelInstance, _titlePrompt?: string) => Promise<Runnable>;
export declare const createCompletionTitleRunnable: (model: t.ChatModelInstance, titlePrompt?: string) => Promise<Runnable>;
