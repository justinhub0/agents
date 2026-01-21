export interface TextStreamOptions {
    minChunkSize?: number;
    maxChunkSize?: number;
    delay?: number;
    firstWordChunk?: boolean;
}
export type ProgressCallback = (chunk: string) => void;
export type PostChunkCallback = (chunk: string) => void;
export declare class TextStream {
    private text;
    private currentIndex;
    private minChunkSize;
    private maxChunkSize;
    private delay;
    private firstWordChunk;
    constructor(text: string, options?: TextStreamOptions);
    private randomInt;
    private static readonly BOUNDARIES;
    private findFirstWordBoundary;
    generateText(signal?: AbortSignal, progressCallback?: ProgressCallback): AsyncGenerator<string, void, unknown>;
}
