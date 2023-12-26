import { OpenAI } from 'openai'
import { ChatCompletionCreateParamsStreaming } from 'openai/resources/index.mjs'
import { GPTConfig } from '../types'
import { chatCompletion } from '../utils/completion'

export const List = (config: GPTConfig) => {
  const list = async (strings: string[], ...values: string[]) => {
    const user = values.map((value, i) => strings[i] + value).join('') + strings[strings.length - 1]
    const completion = await chatCompletion({ user, ...config })
    const content = completion.choices?.[0].message.content
    return content ? parseList(content) : []
  }
  return { list }
}

function parseList(listStr: string): string[] {
  // Define a regex pattern to match lines with '1. value', '1) value', '- value', or ' - value'
  const listItemRegex = /^\s*\d+\.\s*(.+)|^\s*\d+\)\s*(.+)|^\s*-\s*(.+)$/gm
  let match: RegExpExecArray | null
  const result: string[] = []

  // Loop over the list string, finding matches with the regex pattern
  while ((match = listItemRegex.exec(listStr)) !== null) {
    // The actual value is in one of the capturing groups (1, 2 or 3)
    const value = match[1] || match[2] || match[3]
    if (value) {
      result.push(value.trim())
    }
  }

  return result
}

export const StreamingList = (config: GPTConfig) => {
  async function* list(strings: string[], ...values: string[]) {
    const user = values.map((value, i) => strings[i] + value).join('') + strings[strings.length - 1]
    const { system, model, db, queue, ...rest } = config
    const openai = config.openai ?? new OpenAI(rest)
    const prompt = {
      model,
      messages: [{ role: 'user', content: user }],
      stream: true,
    } as ChatCompletionCreateParamsStreaming
    if (system) prompt.messages.unshift({ role: 'system', content: system })
    const completion = await openai.chat.completions.create(prompt)

    const stream = await openai.chat.completions.create(prompt)
    let content = ''
    let seperator: string | undefined
    let numberedList: RegExpMatchArray | undefined | null

    for await (const part of stream) {
      const { delta, finish_reason } = part.choices[0]
      content += delta?.content || ''
      if (seperator === undefined && content.length > 4) {
        numberedList = content.match(/(\d+\.\s)/g)
        seperator = numberedList ? '\n' : ', '
      }

      const numberedRegex = /\d+\.\s(?:")?([^"]+)(?:")?/

      if (seperator && content.includes(seperator)) {
        // get the string before the newline, and modify `content` to be the string after the newline
        // then yield the string before the newline
        const items = content.split(seperator)
        while (items.length > 1) {
          const item = items.shift()
          yield numberedList ? item?.match(numberedRegex)?.[1] : item
        }
        content = items[0]
      }

      if (finish_reason) {
        // TODO: Figure out DB saving strategy for streaming
        // if (db) {
        //   db.log(prompt, completion as ChatCompletion)
        // }

        yield numberedList ? content.match(numberedRegex)?.[1] : content
      }
    }
  }
  return { list }
}
