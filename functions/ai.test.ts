import { describe, test, it, expect } from 'vitest'

import { AI } from './ai'

describe('AI Functions', async () => {

  const { ai } = AI()

  it('should be initialized', () => {
    expect(ai).toBeDefined()
  })

  
  const categorizeWord = ai.categorizeWord({
    type: 'Noun | Verb | Adjective | Adverb | Pronoun | Preposition | Conjunction | Interjection | Other',
    example: 'use the word in a sentence',
    // partOfSpeech: 'Part of speech'
  }, { seed: 1, model: 'gpt-3.5-turbo' })

  it('should be a function', () => {
    
    expect(typeof categorizeWord).toBe('function')
  })

  it('Destroy should be a verb', async () => {
    expect(await categorizeWord('destroy')).toMatchObject({ type: 'Verb', example: 'I will destroy the old building.' })
  })

  it('Dog should be a Noun', async () => {
    const dog = await categorizeWord({ word: 'dog' })
    expect(dog).toMatchObject({ type: 'Noun', example: 'I have a dog.' })
  })

  it('Large should be an Adjective', async () => {
    expect(await categorizeWord({ word: 'large' })).toMatchObject({ type: 'Adjective', example: 'She has a large collection of books.' })
  })
  it('To should be an Preposition', async () => {
    expect(await categorizeWord('to')).toMatchObject({ type: 'Preposition', example: "I'm going to the park." })
  })

})
