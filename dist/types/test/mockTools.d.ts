import type { StructuredToolInterface } from '@langchain/core/tools';
import type { LCToolRegistry } from '@/types';
/**
 * Mock get_team_members tool - returns list of team members
 */
export declare function createGetTeamMembersTool(): StructuredToolInterface;
/**
 * Mock get_expenses tool - returns expense records for a user
 */
export declare function createGetExpensesTool(): StructuredToolInterface;
/**
 * Mock get_weather tool - returns weather data for a city
 */
export declare function createGetWeatherTool(): StructuredToolInterface;
/**
 * Mock calculator tool - evaluates mathematical expressions
 */
export declare function createCalculatorTool(): StructuredToolInterface;
/**
 * Creates a tool registry for programmatic tool calling tests.
 * Tools are configured with allowed_callers to demonstrate classification.
 */
export declare function createProgrammaticToolRegistry(): LCToolRegistry;
/**
 * Creates a sample tool registry for tool search tests.
 * Includes mix of deferred and non-deferred tools.
 */
export declare function createToolSearchToolRegistry(): LCToolRegistry;
