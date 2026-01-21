import type { AnthropicTextBlockParam, AnthropicWebSearchResultBlockParam } from '@/llm/anthropic/types';
import type { SearchResultData } from './types';
/**
 * Coerces Anthropic web search results to the SearchResultData format
 * @param results - Array of Anthropic web search results
 * @param turn - The turn number to associate with these results
 * @returns SearchResultData with minimal ProcessedOrganic items
 */
export declare function coerceAnthropicSearchResults({ results, turn, }: {
    results: (AnthropicTextBlockParam | AnthropicWebSearchResultBlockParam)[];
    turn?: number;
}): SearchResultData;
/**
 * Helper function to check if an object is an Anthropic web search result
 */
export declare function isAnthropicWebSearchResult(obj: unknown): obj is AnthropicWebSearchResultBlockParam;
