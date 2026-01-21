import type * as t from './types';
/**
 * Expand highlights in search results using smart boundary detection.
 *
 * This implementation finds natural text boundaries like paragraphs, sentences,
 * and phrases to provide context while maintaining readability.
 *
 * @param searchResults - Search results object
 * @param mainExpandBy - Primary expansion size on each side (default: 300)
 * @param separatorExpandBy - Additional range to look for separators (default: 150)
 * @returns Copy of search results with expanded highlights and tracked references
 */
export declare function expandHighlights(searchResults: t.SearchResultData, mainExpandBy?: number, separatorExpandBy?: number): t.SearchResultData;
