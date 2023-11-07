import type { MongoClient, Db, Collection, InsertOneResult } from 'mongodb'
import type { ChatCompletion, ChatCompletionCreateParamsNonStreaming } from 'openai/resources/index.mjs'

export let client: MongoClient
export let db: Db
export let cache: Collection
export let cacheTTL: number
export let events: Collection
export let jobs: Collection

export type AIDBConfig = {
  client: MongoClient
  db?: Db | string
  cache?: Collection | string
  cacheTTL?: number
  events?: Collection | string
  jobs?: Collection | string
}

export type AIDB = {
  client: MongoClient
  db: Db
  cache: Collection
  cacheTTL: number
  events: Collection
  log: (prompt: ChatCompletionCreateParamsNonStreaming, completion: ChatCompletion) => Promise<InsertOneResult<any>>
  jobs: Collection
}

export const AIDB = (args: AIDBConfig | MongoClient) => {
  const config = (args as AIDBConfig).client ? (args as AIDBConfig) : { client: args as MongoClient }
  client = config.client
  db = typeof config.db === 'string' ? client.db(config.db) : config.db ?? client.db()
  cache = typeof config.cache === 'string' ? db.collection(config.cache) : config.cache ?? db.collection('ai-cache')
  cacheTTL = config.cacheTTL ?? 1000 * 60 * 60 * 24 * 30
  events =
    typeof config.events === 'string' ? db.collection(config.events) : config.events ?? db.collection('ai-events')
  jobs = typeof config.jobs === 'string' ? db.collection(config.jobs) : config.jobs ?? db.collection('ai-jobs')
  return { client, db, cache, events, log, jobs } as AIDB
}

const log = (prompt: ChatCompletionCreateParamsNonStreaming, completion: ChatCompletion) => {
  const system = prompt.messages.find((message) => message.role === 'system')?.content
  const userMessages = prompt.messages.filter((message) => message.role === 'user').map((message) => message.content)
  const user = userMessages.length === 1 ? userMessages[0] : userMessages
  const content = completion.choices?.[0].message.content
  const tool = completion.choices?.[0].message.tool_calls?.[0].function
  let functionData: object | string | undefined
  try {
    if (tool) functionData = JSON.parse(tool.arguments)
  } catch (err) {
    functionData = tool?.arguments
  }
  const timestamp = new Date()
  const event = {
    timestamp,
    user,
    system,
    content,
    functionName: tool?.name,
    functionData,
    prompt,
    completion,
  }
  return events.insertOne(event, { ignoreUndefined: true })
}
