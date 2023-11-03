import { describe, it, expect } from 'vitest'
import { OpenAI } from 'openai'
import { initList } from './list'

const openai = new OpenAI()


describe('list', () => {

  const list = initList({ openai })

  it('should return a generator', () => {
    expect(list).toBeInstanceOf(Function)
  })

  it('should generate 3 items', async () => {
    let items: string[] = []
    for await (const item of list`3 synonyms for "fun"`) {
      items.push(item)
    }
    console.log({ items })
    expect(items).toHaveLength(3)
    expect(items[0]).toBeTruthy()
  })

})