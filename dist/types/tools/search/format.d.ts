import type * as t from './types';
export declare function formatResultsForLLM(turn: number, results: t.SearchResultData): {
    output: string;
    references: t.ResultReference[];
};
