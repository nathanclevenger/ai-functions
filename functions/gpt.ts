import { OpenAI, ClientOptions } from 'openai'
import type { ChatCompletion, ChatCompletionCreateParamsNonStreaming } from 'openai/resources/index.mjs'
import { GPTConfig } from '../types'


export const GPT = (config: GPTConfig) => {
  const { system, model, db, queue, ...rest } = config
  const openai = config.openai ?? new OpenAI(rest)
  const gpt = async (strings: string[], ...values: string[]) => {
    const user =
      values.map((value, i) => strings[i] + value).join('') +
      strings[strings.length - 1]
    const prompt = { model, messages: [{ role: 'user', content: user }] } as ChatCompletionCreateParamsNonStreaming
    if (system) prompt.messages.unshift({ role: 'system', content: system })
    const completion = queue 
      ? await queue.add(() => openai.chat.completions.create(prompt)) 
      : await openai.chat.completions.create(prompt)
    const content = (completion as ChatCompletion).choices?.[0].message.content
    if (db) {
      db.log(prompt, completion as ChatCompletion)
    }
    return content
  }
  return { gpt } 
}