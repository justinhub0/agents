import type { ChatModelConstructorMap, ProviderOptionsMap, ChatModelMap } from '@/types';
import { Providers } from '@/common';
export declare const llmProviders: Partial<ChatModelConstructorMap>;
export declare const manualToolStreamProviders: Set<string>;
export declare const getChatModelClass: <P extends Providers>(provider: P) => new (config: ProviderOptionsMap[P]) => ChatModelMap[P];
