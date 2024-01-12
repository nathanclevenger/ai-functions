import type { OpenAI, ClientOptions } from 'openai'
import type { ChatCompletion, ChatCompletionCreateParamsNonStreaming } from 'openai/resources'
import type { AIDB } from './db/mongo'
import type PQueue from 'p-queue'

export type GPTConfig = {
  openai?: OpenAI
  system?: string
  model?: ChatCompletionCreateParamsNonStreaming['model'] | 'gpt-4-1106-preview' | 'gpt-3.5-turbo-1106'
  db?: AIDB
  queue?: PQueue
} & ClientOptions
