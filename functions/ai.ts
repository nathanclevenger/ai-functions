import { ClientOptions, OpenAI } from 'openai'
import { AIDB, AIDBConfig } from '../db/mongo'

export type AIConfig = ClientOptions & {
  db: AIDBConfig
  openai?: OpenAI
  system?: string
}

export const AI = (config: AIConfig) => {
  const { system, ...rest } = config
  const openai = config.openai ?? new OpenAI(rest)
  const { client, db, cache, events, jobs } = AIDB(config.db)

  const completion = openai.chat.completions.create({
    model: 'gpt-4-1106-preview',
    messages: [{ role: 'user', content: 'hello' }],
  })
}
