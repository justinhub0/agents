import type * as t from '@/types';
export declare const createMockStream: (options?: {
    text?: string;
    reasoningText?: string;
    streamRate?: number;
    reasoningKey?: "reasoning" | "reasoning_content";
}) => () => AsyncGenerator<t.CustomChunk>;
/**
(async function testStream(): Promise<void> {
  const runId = nanoid();

  const streamHandler = new SplitStreamHandler({
    runId,
    handlers: {
      [GraphEvents.ON_RUN_STEP]: (data): void => {
        console.dir(data, { depth: null });
      },
      [GraphEvents.ON_MESSAGE_DELTA]: (): void => {
        // console.dir(data, { depth: null });
      },
    },
  });
  const stream = createMockStream({
    reasoningText: 'This is a test reasoning text.',
    streamRate: 5,
  })();

  for await (const chunk of stream) {
    streamHandler.handle(chunk);
  }
})();
 */ 
