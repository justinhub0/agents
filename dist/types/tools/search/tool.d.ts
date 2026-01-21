import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
import type * as t from './types';
import { DATE_RANGE } from './schema';
/**
 * Creates a search tool with a schema that dynamically includes the country field
 * only when the searchProvider is 'serper'.
 *
 * Supports multiple scraper providers:
 * - Firecrawl (default): Full-featured web scraping with multiple formats
 * - Serper: Lightweight scraping using Serper's scrape API
 *
 * @example
 * ```typescript
 * // Using Firecrawl scraper (default)
 * const searchTool = createSearchTool({
 *   searchProvider: 'serper',
 *   scraperProvider: 'firecrawl',
 *   firecrawlApiKey: 'your-firecrawl-key'
 * });
 *
 * // Using Serper scraper
 * const searchTool = createSearchTool({
 *   searchProvider: 'serper',
 *   scraperProvider: 'serper',
 *   serperApiKey: 'your-serper-key'
 * });
 * ```
 *
 * @param config - The search tool configuration
 * @returns A DynamicStructuredTool with a schema that depends on the searchProvider
 */
export declare const createSearchTool: (config?: t.SearchToolConfig) => DynamicStructuredTool<z.ZodObject<{
    query: z.ZodString;
    date: z.ZodOptional<z.ZodNativeEnum<typeof DATE_RANGE>>;
    country?: z.ZodOptional<z.ZodString>;
    images: z.ZodOptional<z.ZodBoolean>;
    videos: z.ZodOptional<z.ZodBoolean>;
    news: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    query: string;
    videos?: boolean | undefined;
    images?: boolean | undefined;
    news?: boolean | undefined;
    date?: DATE_RANGE | undefined;
    country?: unknown;
}, {
    query: string;
    videos?: boolean | undefined;
    images?: boolean | undefined;
    news?: boolean | undefined;
    date?: DATE_RANGE | undefined;
    country?: unknown;
}>>;
