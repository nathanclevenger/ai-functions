import { BSON } from 'bson'
import { AIDB } from '../db/mongo'
import PQueue from 'p-queue'
import { CompletionInput } from '../utils/completion'
import { createMachine, createActor } from 'xstate'

let localQueue

export type QueueConfig = AIDB & {
  concurrency?: number
}

export type QueueInput = (CompletionInput | ({ list: string } &  Partial<CompletionInput>)) & {
  metadata?: object
  merge?: string | {
    into: string
    on?: BSON.Document
    let?: BSON.Document
  }
  target: string
}

export const startQueue = (config: QueueConfig) => {
  config.queue

}