/* eslint-disable no-console */
// src/messages/compact.ts
import { AIMessage } from '@langchain/core/messages';
import type { BaseMessage } from '@langchain/core/messages';
import type { CompactionConfig } from '@/types';

/**
 * Model context windows for compaction threshold calculation
 */
const MODEL_CONTEXT_WINDOWS: Record<string, number> = {
  'gpt-5.2': 300000,
  'gpt-5.2-pro': 300000,
  'gpt-5.2-codex': 300000,
};

/**
 * Get the context window size for a model
 */
export function getModelContextWindow(model: string): number {
  const lowerModel = model.toLowerCase();
  for (const [key, value] of Object.entries(MODEL_CONTEXT_WINDOWS)) {
    if (lowerModel.includes(key)) {
      return value;
    }
  }
  return 128000;
}

/**
 * Check if a model supports compaction
 */
export function supportsCompaction(model: string): boolean {
  if (!model) return false;
  const lowerModel = model.toLowerCase();
  return lowerModel.includes('gpt-5.2');
}

/**
 * Fixed token estimate per image based on OpenAI's pricing model.
 * Images are charged at a flat rate rather than by character count.
 */
const IMAGE_TOKEN_ESTIMATE = 1000;

/**
 * Detect if a string contains base64 image data
 */
function isBase64ImageData(str: string): boolean {
  if (typeof str !== 'string') return false;
  // Check for data URI prefix
  if (str.startsWith('data:image/')) return true;
  // Check for base64 pattern (long string of base64 characters without spaces)
  // Base64 images are typically very long (>1000 chars) and contain only base64 chars
  if (str.length > 1000 && /^[A-Za-z0-9+/=]+$/.test(str.slice(0, 100)))
    return true;
  return false;
}

/**
 * Recursively estimate tokens for content, excluding base64 image data
 */
function estimateTokensExcludingImages(content: unknown): number {
  if (content === null || content === undefined) return 0;

  if (typeof content === 'string') {
    // Skip base64 image data - use fixed estimate instead
    if (isBase64ImageData(content)) {
      return IMAGE_TOKEN_ESTIMATE;
    }
    return Math.ceil(content.length / 4);
  }

  if (Array.isArray(content)) {
    return content.reduce(
      (sum, item) => sum + estimateTokensExcludingImages(item),
      0
    );
  }

  if (typeof content === 'object') {
    const obj = content as Record<string, unknown>;
    let tokens = 0;

    for (const [key, value] of Object.entries(obj)) {
      // Skip fields that typically contain base64 image data
      if (key === 'url' || key === 'image_url' || key === 'data') {
        if (typeof value === 'string' && isBase64ImageData(value)) {
          tokens += IMAGE_TOKEN_ESTIMATE;
          continue;
        }
        if (typeof value === 'object' && value !== null && 'url' in value) {
          const urlValue = (value as { url: unknown }).url;
          if (typeof urlValue === 'string' && isBase64ImageData(urlValue)) {
            tokens += IMAGE_TOKEN_ESTIMATE;
            continue;
          }
        }
      }

      // Handle image_url and input_image content types
      if (obj.type === 'image_url' || obj.type === 'input_image') {
        tokens += IMAGE_TOKEN_ESTIMATE;
        break; // Don't double count
      }

      tokens += estimateTokensExcludingImages(value);
    }

    return tokens;
  }

  return 0;
}

/**
 * Estimate tokens for a message (rough estimation: 4 chars per token)
 * Excludes base64 image data from character counting, using fixed estimates instead.
 */
export function estimateMessageTokens(message: BaseMessage): number {
  const content = message.content;
  if (typeof content === 'string') {
    // Check if the entire content is base64 image data
    if (isBase64ImageData(content)) {
      return IMAGE_TOKEN_ESTIMATE;
    }
    return Math.ceil(content.length / 4);
  }
  if (Array.isArray(content)) {
    return estimateTokensExcludingImages(content);
  }
  return 0;
}

/**
 * Truncate messages to fit within context window when compaction isn't enough.
 * Keeps system message and most recent messages, removes old middle messages.
 */
export function truncateToFitContext(
  messages: BaseMessage[],
  maxTokens: number,
  reserveTokens: number = 8000
): BaseMessage[] {
  const targetTokens = maxTokens - reserveTokens; // Leave room for response

  const totalTokens = messages.reduce(
    (sum, m) => sum + estimateMessageTokens(m),
    0
  );

  if (totalTokens <= targetTokens) {
    return messages;
  }

  console.log(
    `[Truncation] Messages exceed ${targetTokens} tokens (${totalTokens}), truncating...`
  );

  // Keep system message (first) and recent messages, remove from middle
  const result: BaseMessage[] = [];
  let currentTokens = 0;

  // Always keep system message if present
  const firstMsg = messages[0];
  if (firstMsg && firstMsg._getType() === 'system') {
    result.push(firstMsg);
    currentTokens += estimateMessageTokens(firstMsg);
  }

  // Add messages from the end until we hit the limit
  const remainingMessages =
    firstMsg?._getType() === 'system' ? messages.slice(1) : messages;
  const messagesToAdd: BaseMessage[] = [];

  for (let i = remainingMessages.length - 1; i >= 0; i--) {
    const msg = remainingMessages[i];
    const msgTokens = estimateMessageTokens(msg);

    if (currentTokens + msgTokens <= targetTokens) {
      messagesToAdd.unshift(msg);
      currentTokens += msgTokens;
    } else {
      // Skip this message and older ones
      break;
    }
  }

  result.push(...messagesToAdd);

  console.log(
    `[Truncation] Reduced from ${totalTokens} to ${currentTokens} tokens (${result.length} messages)`
  );

  return result;
}

/**
 * Convert BaseMessage to OpenAI Responses API format
 * Note: Tool messages are converted to user messages since /responses/compact
 * only supports 'assistant', 'system', 'developer', and 'user' roles
 */
function convertToResponsesFormat(
  messages: BaseMessage[]
): Array<{ role: string; content: string }> {
  const result: Array<{ role: string; content: string }> = [];

  for (const msg of messages) {
    const msgType = msg._getType();
    let role: string;
    let content: string;

    // Convert content to string
    if (typeof msg.content === 'string') {
      content = msg.content;
    } else if (Array.isArray(msg.content)) {
      // Handle content arrays by extracting text
      content = msg.content
        .map((c) => {
          if (typeof c === 'string') return c;
          if (typeof c === 'object' && c !== null && 'text' in c) {
            return (c as { text: string }).text;
          }
          return JSON.stringify(c);
        })
        .join('\n');
    } else {
      content = JSON.stringify(msg.content);
    }

    // Skip empty content
    if (!content || content.trim() === '') {
      continue;
    }

    if (msgType === 'human') {
      role = 'user';
    } else if (msgType === 'ai') {
      role = 'assistant';
      // For AI messages with tool calls but no text content, add a placeholder
      if (!content.trim() && 'tool_calls' in msg && msg.tool_calls) {
        content = '[Tool calls made]';
      }
    } else if (msgType === 'system') {
      role = 'system';
    } else if (msgType === 'tool') {
      // Convert tool messages to user messages with context
      role = 'user';
      const toolName = 'name' in msg ? (msg as { name: string }).name : 'tool';
      content = `[Tool result from ${toolName}]: ${content}`;
    } else {
      role = 'user';
    }

    result.push({ role, content });
  }

  return result;
}

export interface CompactionResult {
  compacted: boolean;
  messages?: BaseMessage[];
  originalTokens?: number;
  compactedTokens?: number;
}

/**
 * Call the OpenAI /responses/compact endpoint to compact conversation
 */
export async function compactConversation(
  messages: BaseMessage[],
  config: CompactionConfig,
  model: string,
  instructions?: string
): Promise<CompactionResult> {
  const thresholdPercent = config.thresholdPercent ?? 0.7;
  const minTokens = config.minTokensBeforeCompaction ?? 10000;
  const contextWindow = getModelContextWindow(model);
  const threshold = contextWindow * thresholdPercent;

  // Estimate current tokens
  let totalTokens = 0;
  for (const msg of messages) {
    totalTokens += estimateMessageTokens(msg);
  }
  if (instructions) {
    totalTokens += Math.ceil(instructions.length / 4);
  }

  console.log(
    `[Compaction] Token estimate: ${totalTokens}, threshold: ${threshold}, minTokens: ${minTokens}`
  );

  // Check if compaction should trigger
  if (totalTokens < minTokens || totalTokens < threshold) {
    return { compacted: false, originalTokens: totalTokens };
  }

  console.log(`[Compaction] Triggering compaction for ${totalTokens} tokens`);

  try {
    const input = convertToResponsesFormat(messages);
    const baseURL = config.baseURL || 'https://api.openai.com/v1';

    const response = await fetch(`${baseURL}/responses/compact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model,
        input,
        ...(instructions && config.preserveInstructions !== false
          ? { instructions }
          : {}),
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[Compaction] API error: ${response.status} - ${errorText}`
      );
      return { compacted: false, originalTokens: totalTokens };
    }

    // The compaction API returns items that may include:
    // - {type: "message", role: "user", content: "..."} - user messages kept verbatim
    // - {type: "compaction", encrypted_content: "..."} - encrypted compaction item
    const data = (await response.json()) as {
      output?: Array<Record<string, unknown>>;
      usage?: {
        total_tokens?: number;
        input_tokens?: number;
        output_tokens?: number;
      };
    };

    if (!data.output || data.output.length === 0) {
      console.warn('[Compaction] No output from compaction API');
      return { compacted: false, originalTokens: totalTokens };
    }

    console.log(`[Compaction] API returned ${data.output.length} items`);

    // Log the types of items returned
    const itemTypes = data.output.map(
      (item) => item.type || item.role || 'unknown'
    );
    console.log(`[Compaction] Item types: ${itemTypes.join(', ')}`);

    // Create a single AIMessage that carries all the compacted items in response_metadata.output
    // This allows _convertMessagesToOpenAIResponsesParams to pass them through directly
    const compactedMessage = new AIMessage({
      content: '[Compacted conversation context]',
      response_metadata: {
        output: data.output, // Raw items from compaction API - will be passed through directly
      },
    });

    // Estimate actual tokens for all returned items (preserved messages + compaction items)
    // Note: data.usage.output_tokens only reflects the compaction summary, not preserved messages
    const estimateItemTokens = (item: Record<string, unknown>): number => {
      // For compaction items, estimate based on encrypted_content
      if (
        item.type === 'compaction' &&
        typeof item.encrypted_content === 'string'
      ) {
        return Math.ceil((item.encrypted_content as string).length / 4);
      }
      // For message items, estimate based on content
      if (item.content) {
        const content =
          typeof item.content === 'string'
            ? item.content
            : JSON.stringify(item.content);
        return Math.ceil(content.length / 4);
      }
      return 100; // Default estimate for items without clear content
    };

    const compactedTokens = data.output.reduce(
      (sum, item) => sum + estimateItemTokens(item),
      0
    );
    const compactionSummaryTokens = data.usage?.output_tokens || 0;

    console.log(
      `[Compaction] Compacted: ${totalTokens} -> ~${compactedTokens} tokens (${data.output.length} items: ${data.output.length - 1} preserved messages + 1 compaction summary of ~${compactionSummaryTokens} tokens)`
    );

    return {
      compacted: true,
      messages: [compactedMessage], // Single message carrying all compacted items
      originalTokens: totalTokens,
      compactedTokens,
    };
  } catch (error) {
    console.error('[Compaction] Error during compaction:', error);
    return { compacted: false, originalTokens: totalTokens };
  }
}
