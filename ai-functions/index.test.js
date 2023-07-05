import assert from 'node:assert'
import { describe, it } from 'node:test'

import { AI } from './index.js'
import { getJsonSchema } from './index.js'

describe('AI', () => {
  it('JSON Schema', () => {
    const schema = getJsonSchema({ 
      name: 'The name of the person',
      age: 'The age of the person' 
    })
    assert.deepEqual(schema, { 
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