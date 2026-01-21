import type * as t from './types';
/**
 * Serper scraper implementation
 * Uses the Serper Scrape API (https://scrape.serper.dev) to scrape web pages
 *
 * Features:
 * - Simple API with single endpoint
 * - Returns both text and markdown content
 * - Includes metadata from scraped pages
 * - Credits-based pricing model
 *
 * @example
 * ```typescript
 * const scraper = createSerperScraper({
 *   apiKey: 'your-serper-api-key',
 *   includeMarkdown: true,
 *   timeout: 10000
 * });
 *
 * const [url, response] = await scraper.scrapeUrl('https://example.com');
 * if (response.success) {
 *   const [content] = scraper.extractContent(response);
 *   console.log(content);
 * }
 * ```
 */
export declare class SerperScraper implements t.BaseScraper {
    private apiKey;
    private apiUrl;
    private timeout;
    private logger;
    private includeMarkdown;
    constructor(config?: t.SerperScraperConfig);
    /**
     * Scrape a single URL
     * @param url URL to scrape
     * @param options Scrape options
     * @returns Scrape response
     */
    scrapeUrl(url: string, options?: t.SerperScrapeOptions): Promise<[string, t.SerperScrapeResponse]>;
    /**
     * Extract content from scrape response
     * @param response Scrape response
     * @returns Extracted content or empty string if not available
     */
    extractContent(response: t.SerperScrapeResponse): [string, undefined | t.References];
    /**
     * Extract metadata from scrape response
     * @param response Scrape response
     * @returns Metadata object
     */
    extractMetadata(response: t.SerperScrapeResponse): Record<string, string | number | boolean | null | undefined>;
}
/**
 * Create a Serper scraper instance
 * @param config Scraper configuration
 * @returns Serper scraper instance
 */
export declare const createSerperScraper: (config?: t.SerperScraperConfig) => SerperScraper;
