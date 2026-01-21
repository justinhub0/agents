import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
import type * as t from '@/types';
/** Zod schema type for tool search parameters */
type ToolSearchSchema = z.ZodObject<{
    query: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    fields: z.ZodDefault<z.ZodOptional<z.ZodArray<z.ZodEnum<['name', 'description', 'parameters']>>>>;
    max_results: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    mcp_server: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodArray<z.ZodString>]>>;
}>;
/**
 * Creates the Zod schema with dynamic query description based on mode.
 * @param mode - The search mode determining query interpretation
 * @returns Zod schema for tool search parameters
 */
declare function createToolSearchSchema(mode: t.ToolSearchMode): ToolSearchSchema;
/**
 * Extracts the MCP server name from a tool name.
 * MCP tools follow the pattern: toolName_mcp_serverName
 * @param toolName - The full tool name
 * @returns The server name if it's an MCP tool, undefined otherwise
 */
declare function extractMcpServerName(toolName: string): string | undefined;
/**
 * Checks if a tool belongs to a specific MCP server.
 * @param toolName - The full tool name
 * @param serverName - The server name to match
 * @returns True if the tool belongs to the specified server
 */
declare function isFromMcpServer(toolName: string, serverName: string): boolean;
/**
 * Checks if a tool belongs to any of the specified MCP servers.
 * @param toolName - The full tool name
 * @param serverNames - Array of server names to match
 * @returns True if the tool belongs to any of the specified servers
 */
declare function isFromAnyMcpServer(toolName: string, serverNames: string[]): boolean;
/**
 * Normalizes server filter input to always be an array.
 * @param serverFilter - String, array of strings, or undefined
 * @returns Array of server names (empty if none specified)
 */
declare function normalizeServerFilter(serverFilter: string | string[] | undefined): string[];
/**
 * Extracts all unique MCP server names from a tool registry.
 * @param toolRegistry - The tool registry to scan
 * @param onlyDeferred - If true, only considers deferred tools
 * @returns Array of unique server names, sorted alphabetically
 */
declare function getAvailableMcpServers(toolRegistry: t.LCToolRegistry | undefined, onlyDeferred?: boolean): string[];
/**
 * Escapes special regex characters in a string to use as a literal pattern.
 * @param pattern - The string to escape
 * @returns The escaped string safe for use in a RegExp
 */
declare function escapeRegexSpecialChars(pattern: string): string;
/**
 * Counts the maximum nesting depth of groups in a regex pattern.
 * @param pattern - The regex pattern to analyze
 * @returns The maximum nesting depth
 */
declare function countNestedGroups(pattern: string): number;
/**
 * Detects nested quantifiers that can cause catastrophic backtracking.
 * Patterns like (a+)+, (a*)*, (a+)*, etc.
 * @param pattern - The regex pattern to check
 * @returns True if nested quantifiers are detected
 */
declare function hasNestedQuantifiers(pattern: string): boolean;
/**
 * Checks if a regex pattern contains potentially dangerous constructs.
 * @param pattern - The regex pattern to validate
 * @returns True if the pattern is dangerous
 */
declare function isDangerousPattern(pattern: string): boolean;
/**
 * Sanitizes a regex pattern for safe execution.
 * If the pattern is dangerous, it will be escaped to a literal string search.
 * @param pattern - The regex pattern to sanitize
 * @returns Object containing the safe pattern and whether it was escaped
 */
declare function sanitizeRegex(pattern: string): {
    safe: string;
    wasEscaped: boolean;
};
/**
 * Performs BM25-based search for better relevance ranking.
 * Uses Okapi BM25 algorithm for term frequency and document length normalization.
 * @param tools - Array of tool metadata to search
 * @param query - The search query
 * @param fields - Which fields to search
 * @param maxResults - Maximum results to return
 * @returns Search response with matching tools ranked by BM25 score
 */
declare function performLocalSearch(tools: t.ToolMetadata[], query: string, fields: string[], maxResults: number): t.ToolSearchResponse;
/**
 * Extracts the base tool name (without MCP server suffix) from a full tool name.
 * @param toolName - The full tool name
 * @returns The base tool name without server suffix
 */
declare function getBaseToolName(toolName: string): string;
/**
 * Generates a compact listing of deferred tools grouped by server.
 * Format: "server: tool1, tool2, tool3"
 * Non-MCP tools are grouped under "other".
 * @param toolRegistry - The tool registry
 * @param onlyDeferred - Whether to only include deferred tools
 * @returns Formatted string with tools grouped by server
 */
declare function getDeferredToolsListing(toolRegistry: t.LCToolRegistry | undefined, onlyDeferred: boolean): string;
/**
 * Formats a server listing response as structured JSON.
 * NOTE: This is a PREVIEW only - tools are NOT discovered/loaded.
 * @param tools - Array of tool metadata from the server(s)
 * @param serverNames - The MCP server name(s)
 * @returns JSON string showing all tools grouped by server
 */
declare function formatServerListing(tools: t.ToolMetadata[], serverNames: string | string[]): string;
/**
 * Creates a Tool Search tool for discovering tools from a large registry.
 *
 * This tool enables AI agents to dynamically discover tools from a large library
 * without loading all tool definitions into the LLM context window. The agent
 * can search for relevant tools on-demand.
 *
 * **Modes:**
 * - `code_interpreter` (default): Uses external sandbox for regex search. Safer for complex patterns.
 * - `local`: Uses safe substring matching locally. No network call, faster, completely safe from ReDoS.
 *
 * The tool registry can be provided either:
 * 1. At initialization time via params.toolRegistry
 * 2. At runtime via config.configurable.toolRegistry when invoking
 *
 * @param params - Configuration parameters for the tool (toolRegistry is optional)
 * @returns A LangChain DynamicStructuredTool for tool searching
 *
 * @example
 * // Option 1: Code interpreter mode (regex via sandbox)
 * const tool = createToolSearch({ apiKey, toolRegistry });
 * await tool.invoke({ query: 'expense.*report' });
 *
 * @example
 * // Option 2: Local mode (safe substring search, no API key needed)
 * const tool = createToolSearch({ mode: 'local', toolRegistry });
 * await tool.invoke({ query: 'expense' });
 */
declare function createToolSearch(initParams?: t.ToolSearchParams): DynamicStructuredTool<ReturnType<typeof createToolSearchSchema>>;
export { createToolSearch, performLocalSearch, extractMcpServerName, isFromMcpServer, isFromAnyMcpServer, normalizeServerFilter, getAvailableMcpServers, getDeferredToolsListing, getBaseToolName, formatServerListing, sanitizeRegex, escapeRegexSpecialChars, isDangerousPattern, countNestedGroups, hasNestedQuantifiers, };
