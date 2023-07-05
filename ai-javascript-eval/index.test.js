import assert from 'node:assert'
import { describe, it } from 'node:test'

import { javascriptEval } from './index.js'

describe('AI', () => {
  it('should work', () => {
    const results = javascriptEval('1 + 1')
    assert.strictEqual(results, 2)
  })

  it('should be ok', async () => {

    const results = javascriptEval(`fetch('https://jsonplaceholder.typicode.com/todos/1').then(res => res.json())`)
    console.log(await results)
    assert.strictEqual(2, 2)
  })
})
