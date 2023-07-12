import { describe, test, it, expect } from 'vitest'

import { AI } from './index.js'
import { getJsonSchema } from './index.js'

test('Math.sqrt()', () => {
  expect(Math.sqrt(4)).toBe(2)
  expect(Math.sqrt(144)).toBe(12)
  expect(Math.sqrt(2)).toBe(Math.SQRT2)
})


test('getJsonSchema', () => {

  const schema = getJsonSchema({ 
    name: 'The name of the person',
    age: 'The age of the person' 
  })

  expect(schema).toEqual({ 
    type: 'object', 
    properties: { 
      name: { type: 'string', description: 'The name of the person' }, 
      age: { type: 'string', description: 'The age of the person' } }, 
      required: ['name', 'age']
  })

})

test('AI', () => {
  AI.writeLandingPage({
    brand: 'Auto.dev',
    audience: 'developers',
    offers: 'Automotive Data APIs',
  })
  
    // AI('writeLandingPage', ({ title, description, heroTitle, heroDescription, featuresTitle, featuresDescription }) => 
})

test('A thing', () => {
  it('should work', () => {
    expect(3).toBe(3)
  })

  it('should be ok', () => {
    expect(2).toBe(2)
  })

  describe('a nested thing', () => {
    it('should work', () => {
      expect(3).toBe(3)
    })
  })
})