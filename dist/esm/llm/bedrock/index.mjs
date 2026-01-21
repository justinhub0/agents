import { ChatBedrockConverse } from '@langchain/aws';
import { AIMessageChunk } from '@langchain/core/messages';
import { ChatGenerationChunk } from '@langchain/core/outputs';

/**
 * Optimized ChatBedrockConverse wrapper that fixes contentBlockIndex conflicts
 * and adds support for latest @langchain/aws features:
 *
 * - Application Inference Profiles (PR #9129)
 * - Service Tiers (Priority/Standard/Flex) (PR #9785) - requires AWS SDK 3.966.0+
 *
 * Bedrock sends the same contentBlockIndex for both text and tool_use content blocks,
 * causing LangChain's merge logic to fail with "field[contentBlockIndex] already exists"
 * errors. This wrapper simply strips contentBlockIndex from response_metadata to avoid
 * the conflict.
 *
 * The contentBlockIndex field is only used internally by Bedrock's streaming protocol
 * and isn't needed by application logic - the index field on tool_call_chunks serves
 * the purpose of tracking tool call ordering.
 */
class CustomChatBedrockConverse extends ChatBedrockConverse {
    /**
     * Application Inference Profile ARN to use instead of model ID.
     */
    applicationInferenceProfile;
    /**
     * Service tier for model invocation.
     */
    serviceTier;
    constructor(fields) {
        super(fields);
        this.applicationInferenceProfile = fields?.applicationInferenceProfile;
        this.serviceTier = fields?.serviceTier;
    }
    static lc_name() {
        return 'LibreChatBedrockConverse';
    }
    /**
     * Get the model ID to use for API calls.
     * Returns applicationInferenceProfile if set, otherwise returns this.model.
     */
    getModelId() {
        return this.applicationInferenceProfile ?? this.model;
    }
    /**
     * Override invocationParams to add serviceTier support.
     */
    invocationParams(options) {
        const baseParams = super.invocationParams(options);
        /** Service tier from options or fall back to class-level setting */
        const serviceTierType = options?.serviceTier ?? this.serviceTier;
        return {
            ...baseParams,
            serviceTier: serviceTierType ? { type: serviceTierType } : undefined,
        };
    }
    /**
     * Override _generateNonStreaming to use applicationInferenceProfile as modelId.
     * Uses the same model-swapping pattern as streaming for consistency.
     */
    async _generateNonStreaming(messages, options, runManager) {
        // Temporarily swap model for applicationInferenceProfile support
        const originalModel = this.model;
        if (this.applicationInferenceProfile != null &&
            this.applicationInferenceProfile !== '') {
            this.model = this.applicationInferenceProfile;
        }
        try {
            return await super._generateNonStreaming(messages, options, runManager);
        }
        finally {
            // Restore original model
            this.model = originalModel;
        }
    }
    /**
     * Override _streamResponseChunks to:
     * 1. Use applicationInferenceProfile as modelId (by temporarily swapping this.model)
     * 2. Strip contentBlockIndex from response_metadata to prevent merge conflicts
     *
     * Note: We delegate to super._streamResponseChunks() to preserve @langchain/aws's
     * internal chunk handling which correctly preserves array content for reasoning blocks.
     */
    async *_streamResponseChunks(messages, options, runManager) {
        // Temporarily swap model for applicationInferenceProfile support
        const originalModel = this.model;
        if (this.applicationInferenceProfile != null &&
            this.applicationInferenceProfile !== '') {
            this.model = this.applicationInferenceProfile;
        }
        try {
            // Use parent's streaming logic which correctly handles reasoning content
            const baseStream = super._streamResponseChunks(messages, options, runManager);
            for await (const chunk of baseStream) {
                // Clean contentBlockIndex from response_metadata to prevent merge conflicts
                yield this.cleanChunk(chunk);
            }
        }
        finally {
            // Restore original model
            this.model = originalModel;
        }
    }
    /**
     * Clean a chunk by removing contentBlockIndex from response_metadata.
     */
    cleanChunk(chunk) {
        const message = chunk.message;
        if (!(message instanceof AIMessageChunk)) {
            return chunk;
        }
        const metadata = message.response_metadata;
        const hasContentBlockIndex = this.hasContentBlockIndex(metadata);
        if (!hasContentBlockIndex) {
            return chunk;
        }
        const cleanedMetadata = this.removeContentBlockIndex(metadata);
        return new ChatGenerationChunk({
            text: chunk.text,
            message: new AIMessageChunk({
                ...message,
                response_metadata: cleanedMetadata,
            }),
            generationInfo: chunk.generationInfo,
        });
    }
    /**
     * Check if contentBlockIndex exists at any level in the object
     */
    hasContentBlockIndex(obj) {
        if (obj === null || obj === undefined || typeof obj !== 'object') {
            return false;
        }
        if ('contentBlockIndex' in obj) {
            return true;
        }
        for (const value of Object.values(obj)) {
            if (typeof value === 'object' && value !== null) {
                if (this.hasContentBlockIndex(value)) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * Recursively remove contentBlockIndex from all levels of an object
     */
    removeContentBlockIndex(obj) {
        if (obj === null || obj === undefined) {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map((item) => this.removeContentBlockIndex(item));
        }
        if (typeof obj === 'object') {
            const cleaned = {};
            for (const [key, value] of Object.entries(obj)) {
                if (key !== 'contentBlockIndex') {
                    cleaned[key] = this.removeContentBlockIndex(value);
                }
            }
            return cleaned;
        }
        return obj;
    }
}

export { CustomChatBedrockConverse };
//# sourceMappingURL=index.mjs.map
