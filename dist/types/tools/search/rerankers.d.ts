import type * as t from './types';
export declare abstract class BaseReranker {
    protected apiKey: string | undefined;
    protected logger: t.Logger;
    constructor(logger?: t.Logger);
    abstract rerank(query: string, documents: string[], topK?: number): Promise<t.Highlight[]>;
    protected getDefaultRanking(documents: string[], topK: number): t.Highlight[];
}
export declare class JinaReranker extends BaseReranker {
    private apiUrl;
    constructor({ apiKey, apiUrl, logger, }: {
        apiKey?: string;
        apiUrl?: string;
        logger?: t.Logger;
    });
    rerank(query: string, documents: string[], topK?: number): Promise<t.Highlight[]>;
}
export declare class CohereReranker extends BaseReranker {
    constructor({ apiKey, logger, }: {
        apiKey?: string;
        logger?: t.Logger;
    });
    rerank(query: string, documents: string[], topK?: number): Promise<t.Highlight[]>;
}
export declare class InfinityReranker extends BaseReranker {
    constructor(logger?: t.Logger);
    rerank(query: string, documents: string[], topK?: number): Promise<t.Highlight[]>;
}
/**
 * Creates the appropriate reranker based on type and configuration
 */
export declare const createReranker: (config: {
    rerankerType: t.RerankerType;
    jinaApiKey?: string;
    jinaApiUrl?: string;
    cohereApiKey?: string;
    logger?: t.Logger;
}) => BaseReranker | undefined;
