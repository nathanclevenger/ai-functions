import type { MongoClient, Db, Collection } from 'mongodb'

export let client: MongoClient
export let db: Db
export let cache: Collection
export let log: Collection
export let queue: Collection

export type AIDBConfig = {
  client: MongoClient
  db?: Db | string
  cache?: Collection | string
  log?: Collection | string
  queue?: Collection | string
}

export const AIDB = (args: AIDBConfig | MongoClient) => {
  const config = (args as AIDBConfig).client ? args as AIDBConfig : { client: args as MongoClient } 
  client = config.client
  db = typeof config.db === 'string' ? client.db(config.db) : config.db ?? client.db()
  cache = typeof config.cache === 'string' ? db.collection(config.cache) : config.cache ?? db.collection('ai-cache')
  log = typeof config.log === 'string' ? db.collection(config.log) : config.log ?? db.collection('ai-log')
  queue = typeof config.queue === 'string' ? db.collection(config.queue) : config.queue ?? db.collection('ai-queue')
  return { client, db, cache, log, queue }
}