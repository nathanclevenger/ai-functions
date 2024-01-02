import { describe, test, it, expect } from 'vitest'

import { AI } from './ai'

describe('AI Functions', async () => {

  const { ai } = AI()

  it('should be initialized', () => {
    expect(ai).toBeDefined()
  })

  
  const categorizeWord = ai.categorizeWord({
    type: 'Noun | Verb | Adjective | Adverb | Pronoun | Preposition | Conjunction | Interjection | Other',
  }, { seed: 1, model: 'gpt-3.5-turbo' })

  it('should be a function', () => {
    
    expect(typeof categorizeWord).toBe('function')
  })

  it('should return a promise', async () => {
    expect(await categorizeWord('destroy')).toMatchObject({ type: 'Verb' })
  })

  it('should return a promise', async () => {
    expect(await categorizeWord('dog')).toMatchObject({ type: 'Noun' })
  })
  
})
