import type { MongoClient, Db, Collection, InsertOneResult, BSON } from 'mongodb'
import type { ChatCompletion, ChatCompletionCreateParamsNonStreaming } from 'openai/resources'
import { QueueInput } from '../queue/mongo'

export let client: MongoClient
export let db: Db
export let cache: Collection
export let cacheTTL: number
export let events: Collection
export let queue: Collection
export let actors: Collection

export type AIDBConfig = {
  client: MongoClient
  db?: Db | string
  cache?: Collection | string
  cacheTTL?: number
  actors?: Collection | string
  events?: Collection | string
  queue?: Collection | string
}

export type AIDB = {
  client: MongoClient
  db: Db
  cache: Collection
  cacheTTL: number
  actors: Collection
  events: Collection
  queue: Collection
  log: (prompt: ChatCompletionCreateParamsNonStreaming, completion: ChatCompletion) => Promise<InsertOneResult<any>>
  send: (input: QueueInput | QueueInput[]) => Promise<InsertOneResult<any>>
}

export const AIDB = (args: AIDBConfig | MongoClient) => {
  const config = (args as AIDBConfig).client ? (args as AIDBConfig) : { client: args as MongoClient }
  client = config.client
  db = typeof config.db === 'string' ? client.db(config.db) : config.db ?? client.db()
  cache = typeof config.cache === 'string' ? db.collection(config.cache) : config.cache ?? db.collection('ai-cache')
  cacheTTL = config.cacheTTL ?? 1000 * 60 * 60 * 24 * 30
  events =
    typeof config.events === 'string' ? db.collection(config.events) : config.events ?? db.collection('ai-events')
  // queue = typeof config.queue === 'string' ? db.collection(config.queue) : config.queue ?? db.collection('ai-queue')
  // actors = typeof config.queue === 'string' ? db.collection(config.queue) : config.queue ?? db.collection('ai-actors')
  return { client, db, cache, actors, events, queue, log }  as AIDB // , send } as AIDB
}

// const send = (input: QueueInput | QueueInput[]) =>
//   Array.isArray(input) ? queue.insertMany(input) : queue.insertOne(input)

const log = (prompt: ChatCompletionCreateParamsNonStreaming, completion: ChatCompletion) => {
  const system = prompt.messages.find((message: any) => message.role === 'system')?.content
  const userMessages = prompt.messages.filter((message: any) => message.role === 'user').map((message) => message.content)
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
