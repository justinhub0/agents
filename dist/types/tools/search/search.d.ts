import type * as t from './types';
export declare const createSearchAPI: (config: t.SearchConfig) => {
    getSources: (params: t.GetSourcesParams) => Promise<t.SearchResult>;
};
export declare const createSourceProcessor: (config?: t.ProcessSourcesConfig, scraperInstance?: t.BaseScraper) => {
    processSources: (fields: t.ProcessSourcesFields) => Promise<t.SearchResultData>;
    topResults: number;
};
