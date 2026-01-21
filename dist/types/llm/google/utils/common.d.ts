import { POSSIBLE_ROLES, type Part, type Content, type EnhancedGenerateContentResponse, type FunctionDeclarationsTool as GoogleGenerativeAIFunctionDeclarationsTool } from '@google/generative-ai';
import { BaseMessage, UsageMetadata } from '@langchain/core/messages';
import { ChatGenerationChunk } from '@langchain/core/outputs';
import type { ChatResult } from '@langchain/core/outputs';
import { GoogleGenerativeAIToolType } from '../types';
export declare const _FUNCTION_CALL_THOUGHT_SIGNATURES_MAP_KEY = "__gemini_function_call_thought_signatures__";
/**
 * Executes a function immediately and returns its result.
 * Functional utility similar to an Immediately Invoked Function Expression (IIFE).
 * @param fn The function to execute.
 * @returns The result of invoking fn.
 */
export declare const iife: <T>(fn: () => T) => T;
export declare function getMessageAuthor(message: BaseMessage): string;
/**
 * Maps a message type to a Google Generative AI chat author.
 * @param message The message to map.
 * @param model The model to use for mapping.
 * @returns The message type mapped to a Google Generative AI chat author.
 */
export declare function convertAuthorToRole(author: string): (typeof POSSIBLE_ROLES)[number];
export declare function convertMessageContentToParts(message: BaseMessage, isMultimodalModel: boolean, previousMessages: BaseMessage[], model?: string): Part[];
export declare function convertBaseMessagesToContent(messages: BaseMessage[], isMultimodalModel: boolean, convertSystemMessageToHumanContent?: boolean, model?: string): Content[] | undefined;
export declare function convertResponseContentToChatGenerationChunk(response: EnhancedGenerateContentResponse, extra: {
    usageMetadata?: UsageMetadata | undefined;
    index: number;
}): ChatGenerationChunk | null;
/**
 * Maps a Google GenerateContentResult to a LangChain ChatResult
 */
export declare function mapGenerateContentResultToChatResult(response: EnhancedGenerateContentResponse, extra?: {
    usageMetadata: UsageMetadata | undefined;
}): ChatResult;
export declare function convertToGenerativeAITools(tools: GoogleGenerativeAIToolType[]): GoogleGenerativeAIFunctionDeclarationsTool[];
