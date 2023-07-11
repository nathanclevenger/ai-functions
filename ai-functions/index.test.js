// import assert from 'node:assert'
// import { describe, it } from 'node:test'

import { describe, test, it, expect } from 'vitest'

import { AI } from './index.js'
import { getJsonSchema } from './index.js'

test('Math.sqrt()', () => {
  expect(Math.sqrt(4)).toBe(2)
  expect(Math.sqrt(144)).toBe(12)
  expect(Math.sqrt(2)).toBe(Math.SQRT2)
})


describe('getJsonSchema', () => {

  it('JSON Schema', () => {

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

  it('should be ok', () => {
    assert.strictEqual(2, 2)
  })
})

describe('A thing', () => {
  it('should work', () => {
    assert.strictEqual(1, 1)
  })

  it('should be ok', () => {
    assert.strictEqual(2, 2)
  })

  describe('a nested thing', () => {
    it('should work', () => {
      assert.strictEqual(3, 3)
    })
  })
})