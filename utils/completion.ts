import { OpenAI, ClientOptions } from 'openai'
import type {
  ChatCompletion,
  ChatCompletionCreateParamsNonStreaming,
} from 'openai/resources/index.mjs'
import { GPTConfig } from '../types'

export type CompletionInput = GPTConfig &
  (
    | {
        user: string
      }
    | ChatCompletionCreateParamsNonStreaming
  )

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
