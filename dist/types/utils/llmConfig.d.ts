import type * as t from '@/types';
export declare const llmConfigs: Record<string, t.LLMConfig | undefined>;
export declare function getLLMConfig(provider: string): t.LLMConfig;
