import { BSON } from 'bson'
import { AIDB } from '../db/mongo'
import PQueue from 'p-queue'
import { chatCompletion, CompletionInput } from '../utils/completion'
import { createMachine, createActor } from 'xstate'
import { ChangeStreamInsertDocument } from 'mongodb'

let localQueue

export type QueueConfig = AIDB & {
  batchSize?: number
  concurrency?: number
  lockExpiration?: number
}

export type QueueInputMerge = {
  into: string
  on?: BSON.Document
  let?: BSON.Document
}
export type QueueInput = (CompletionInput | ({ list: string } & Partial<CompletionInput>)) & {
  metadata?: object
  merge?: string | QueueInputMerge
  target: string
}

export type QueueDocument = QueueInput & {
  lockedAt: Date
  lockedBy: string
}

export const startQueue = async (config: QueueConfig) => {

  const { concurrency = 10, batchSize = 100, lockExpiration = 3600, ...db } = config
  const instance = Math.random().toString(36).substring(2, 6)
  const queue = new PQueue({ concurrency })

  const clearExpiredLocks = () => db.queue.updateMany(
    { lockedAt: { $lt: new Date(Date.now() - lockExpiration * 1000) } },
    { $unset: { lockedAt: '', lockedBy: '' } }
  )

  const lockBatch = () => db.queue.aggregate([
    { $match: { lockedAt: { $exists: false } } },
    { $limit: batchSize },
    { $set: { lockedAt: new Date(), lockedBy: instance } },
    { $merge: { into: 'queue', on: '_id', whenMatched: 'replace' } },
  ]).toArray()

  db.queue.watch<QueueInput, ChangeStreamInsertDocument<QueueInput>>([
    { $match: { lockedBy: instance } },
  ]).on('change', (change) => queue.add(() => chatCompletion(change.fullDocument)))

  queue.on('idle', async () => {
    await clearExpiredLocks()
    await lockBatch()
  })

  queue.start()

}

