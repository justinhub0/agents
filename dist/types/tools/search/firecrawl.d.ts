import type * as t from './types';
/**
 * Firecrawl scraper implementation
 * Uses the Firecrawl API to scrape web pages
 */
export declare class FirecrawlScraper implements t.BaseScraper {
    private apiKey;
    private apiUrl;
    private version;
    private defaultFormats;
    private timeout;
    private logger;
    private includeTags?;
    private excludeTags?;
    private waitFor?;
    private maxAge?;
    private mobile?;
    private skipTlsVerification?;
    private blockAds?;
    private removeBase64Images?;
    private parsePDF?;
    private storeInCache?;
    private zeroDataRetention?;
    private headers?;
    private location?;
    private onlyMainContent?;
    private changeTrackingOptions?;
    constructor(config?: t.FirecrawlScraperConfig);
    /**
     * Scrape a single URL
     * @param url URL to scrape
     * @param options Scrape options
     * @returns Scrape response
     */
    scrapeUrl(url: string, options?: t.FirecrawlScrapeOptions): Promise<[string, t.FirecrawlScrapeResponse]>;
    /**
     * Extract content from scrape response
     * @param response Scrape response
     * @returns Extracted content or empty string if not available
     */
    extractContent(response: t.FirecrawlScrapeResponse): [string, undefined | t.References];
    /**
     * Extract metadata from scrape response
     * @param response Scrape response
     * @returns Metadata object
     */
    extractMetadata(response: t.FirecrawlScrapeResponse): t.ScrapeMetadata;
}
/**
 * Create a Firecrawl scraper instance
 * @param config Scraper configuration
 * @returns Firecrawl scraper instance
 */
export declare const createFirecrawlScraper: (config?: t.FirecrawlScraperConfig) => FirecrawlScraper;
