'use strict';

var zod = require('zod');

exports.DATE_RANGE = void 0;
(function (DATE_RANGE) {
    DATE_RANGE["PAST_HOUR"] = "h";
    DATE_RANGE["PAST_24_HOURS"] = "d";
    DATE_RANGE["PAST_WEEK"] = "w";
    DATE_RANGE["PAST_MONTH"] = "m";
    DATE_RANGE["PAST_YEAR"] = "y";
})(exports.DATE_RANGE || (exports.DATE_RANGE = {}));
const DEFAULT_QUERY_DESCRIPTION = `
GUIDELINES:
- Start broad, then narrow: Begin with key concepts, then refine with specifics
- Think like sources: Use terminology experts would use in the field
- Consider perspective: Frame queries from different viewpoints for better results
- Quality over quantity: A precise 3-4 word query often beats lengthy sentences

TECHNIQUES (combine for power searches):
- EXACT PHRASES: Use quotes ("climate change report")
- EXCLUDE TERMS: Use minus to remove unwanted results (-wikipedia)
- SITE-SPECIFIC: Restrict to websites (site:edu research)
- FILETYPE: Find specific documents (filetype:pdf study)
- OR OPERATOR: Find alternatives (electric OR hybrid cars)
- DATE RANGE: Recent information (data after:2020)
- WILDCARDS: Use * for unknown terms (how to * bread)
- SPECIFIC QUESTIONS: Use who/what/when/where/why/how
- DOMAIN TERMS: Include technical terminology for specialized topics
- CONCISE TERMS: Prioritize keywords over sentences
`.trim();
const DEFAULT_COUNTRY_DESCRIPTION = `Country code to localize search results.
Use standard 2-letter country codes: "us", "uk", "ca", "de", "fr", "jp", "br", etc.
Provide this when the search should return results specific to a particular country.
Examples:
- "us" for United States (default)
- "de" for Germany
- "in" for India
`.trim();
const querySchema = zod.z.string().describe(DEFAULT_QUERY_DESCRIPTION);
const dateSchema = zod.z
    .nativeEnum(exports.DATE_RANGE)
    .optional()
    .describe('Date range for search results.');
const countrySchema = zod.z
    .string()
    .optional()
    .describe(DEFAULT_COUNTRY_DESCRIPTION);
const imagesSchema = zod.z
    .boolean()
    .optional()
    .describe('Whether to also run an image search.');
const videosSchema = zod.z
    .boolean()
    .optional()
    .describe('Whether to also run a video search.');
const newsSchema = zod.z
    .boolean()
    .optional()
    .describe('Whether to also run a news search.');

exports.DEFAULT_COUNTRY_DESCRIPTION = DEFAULT_COUNTRY_DESCRIPTION;
exports.DEFAULT_QUERY_DESCRIPTION = DEFAULT_QUERY_DESCRIPTION;
exports.countrySchema = countrySchema;
exports.dateSchema = dateSchema;
exports.imagesSchema = imagesSchema;
exports.newsSchema = newsSchema;
exports.querySchema = querySchema;
exports.videosSchema = videosSchema;
//# sourceMappingURL=schema.cjs.map
