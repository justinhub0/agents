// src/scripts/args.ts
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { llmConfigs } from '@/utils/llmConfig';
import { Providers } from '@/common';

export async function getArgs(): Promise<{
  userName: string;
  location: string;
  provider: Providers;
  currentDate: string;
}> {
  const argv = yargs(hideBin(process.argv))
    .option('name', {
      alias: 'n',
      type: 'string',
      description: 'User name',
      default: 'Jo',
    })
    .option('location', {
      alias: 'l',
      type: 'string',
      description: 'User location',
      default: 'New York',
    })
    .option('provider', {
      alias: 'p',
      type: 'string',
      description: 'LLM provider',
      choices: Object.keys(llmConfigs),
      default: Providers.OPENAI,
    })
    .help()
    .alias('help', 'h').argv;

  const args = await argv;
  const userName = args.name as string;
  const location = args.location as string;
  const provider = args.provider as Providers;
  const currentDate = new Date().toLocaleString();

  return {
    userName,
    location,
    provider,
    currentDate,
  };
}
