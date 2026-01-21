export declare function isPresent(value: string | null | undefined): value is string;
/**
 * Recursively unescapes all string values in an object
 * @param obj The object to unescape
 * @returns The unescaped object
 */
export declare function unescapeObject(obj: unknown, key?: string): unknown;
