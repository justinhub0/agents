import { z } from 'zod';
export declare enum DATE_RANGE {
    PAST_HOUR = "h",
    PAST_24_HOURS = "d",
    PAST_WEEK = "w",
    PAST_MONTH = "m",
    PAST_YEAR = "y"
}
export declare const DEFAULT_QUERY_DESCRIPTION: string;
export declare const DEFAULT_COUNTRY_DESCRIPTION: string;
export declare const querySchema: z.ZodString;
export declare const dateSchema: z.ZodOptional<z.ZodNativeEnum<typeof DATE_RANGE>>;
export declare const countrySchema: z.ZodOptional<z.ZodString>;
export declare const imagesSchema: z.ZodOptional<z.ZodBoolean>;
export declare const videosSchema: z.ZodOptional<z.ZodBoolean>;
export declare const newsSchema: z.ZodOptional<z.ZodBoolean>;
