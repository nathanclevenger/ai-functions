import { OpenAI, ClientOptions } from 'openai'
import type { ChatCompletion, ChatCompletionCreateParamsNonStreaming } from 'openai/resources'
import { GPTConfig } from '../types'

export type CompletionInput = GPTConfig &
  (
    | (({ user: string } | { list: string }) & Partial<ChatCompletionCreateParamsNonStreaming>)
    | ChatCompletionCreateParamsNonStreaming
  )
// TODO: add support for list input and parsing
// TODO: add support for caching w/ seed generation for unit tests

export const chatCompletion = async (config: CompletionInput) => {
  const { user, system, model, db, queue, ...rest } = config
  const openai = config.openai ?? new OpenAI(rest)
  const prompt = {
    model,
    messages: [{ role: 'user', content: user }],
  } as ChatCompletionCreateParamsNonStreaming
  if (system) prompt.messages.unshift({ role: 'system', content: system })
  const completion = queue
    ? await queue.add(() => openai.chat.completions.create(prompt))
    : await openai.chat.completions.create(prompt)
  if (db) {
    db.log(prompt, completion as ChatCompletion)
  }
  return completion as ChatCompletion
}
