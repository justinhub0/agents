import { z } from 'zod';
import { DynamicStructuredTool } from '@langchain/core/tools';
import type * as t from '@/types';
export declare const imageExtRegex: RegExp;
export declare const getCodeBaseURL: () => string;
declare const CodeExecutionToolSchema: z.ZodObject<{
    lang: z.ZodEnum<["py", "js", "ts", "c", "cpp", "java", "php", "rs", "go", "d", "f90", "r"]>;
    code: z.ZodString;
    args: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    code: string;
    lang: "r" | "d" | "py" | "js" | "ts" | "c" | "cpp" | "java" | "php" | "rs" | "go" | "f90";
    args?: string[] | undefined;
}, {
    code: string;
    lang: "r" | "d" | "py" | "js" | "ts" | "c" | "cpp" | "java" | "php" | "rs" | "go" | "f90";
    args?: string[] | undefined;
}>;
declare function createCodeExecutionTool(params?: t.CodeExecutionToolParams): DynamicStructuredTool<typeof CodeExecutionToolSchema>;
export { createCodeExecutionTool };
