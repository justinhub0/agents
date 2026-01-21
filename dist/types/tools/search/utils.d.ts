import type * as t from './types';
/**
 * Creates a default logger that maps to console methods
 * Uses a singleton pattern to avoid creating multiple instances
 * @returns A default logger that implements the Logger interface
 */
export declare const createDefaultLogger: () => t.Logger;
export declare const fileExtRegex: RegExp;
export declare const getDomainName: (link: string, metadata?: t.ScrapeMetadata, logger?: t.Logger) => string | undefined;
export declare function getAttribution(link: string, metadata?: t.ScrapeMetadata, logger?: t.Logger): string | undefined;
