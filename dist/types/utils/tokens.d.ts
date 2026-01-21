import type { BaseMessage } from '@langchain/core/messages';
export declare function getTokenCountForMessage(message: BaseMessage, getTokenCount: (text: string) => number): number;
/**
 * Creates a singleton token counter function that reuses the same encoder instance.
 * This avoids creating multiple function closures and prevents potential memory issues.
 */
export declare const createTokenCounter: () => Promise<(message: BaseMessage) => number>;
/**
 * Utility to manage the token encoder lifecycle explicitly.
 * Useful for applications that need fine-grained control over resource management.
 */
export declare const TokenEncoderManager: {
    /**
     * Pre-initializes the encoder. This can be called during app startup
     * to avoid lazy loading delays later.
     */
    initialize(): Promise<void>;
    /**
     * Clears the cached encoder and token counter.
     * Useful for testing or when you need to force a fresh reload.
     */
    reset(): void;
    /**
     * Checks if the encoder has been initialized.
     */
    isInitialized(): boolean;
};
