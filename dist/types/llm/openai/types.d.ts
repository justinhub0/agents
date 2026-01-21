import type { OpenAICallOptions } from '@langchain/openai';
export interface OpenAIChatCallOptions extends OpenAICallOptions {
    promptIndex?: number;
}
export type OpenAIRoleEnum = 'system' | 'developer' | 'assistant' | 'user' | 'function' | 'tool';
export type HeaderValue = string | undefined | null;
export type HeadersLike = Headers | readonly HeaderValue[][] | Record<string, HeaderValue | readonly HeaderValue[]> | undefined | null | {
    values: Headers;
    [key: string]: unknown;
};
