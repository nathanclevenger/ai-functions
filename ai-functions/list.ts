import { OpenAI } from 'openai'

// const openai = new OpenAI()
import type { ChatCompletionCreateParamsStreaming } from 'openai/resources/chat/completions'

type ListInit = {
  model?: ChatCompletionCreateParamsStreaming['model']
  system?: string
  openai: OpenAI
}

export const initList = ({ model = 'gpt-3.5-turbo', system, openai }: ListInit) => 
  async function* list(strings, ...values) {
    const listPrompt = values.map((value, i) => strings[i] + value).join('') + strings[strings.length - 1]
    const prompt = {
      model,
      messages: [{ role: 'user', content: 'List ' + listPrompt }],
      stream: true,
    }
    if (system) prompt.messages.unshift({ role: 'system', content: system })
    // @ts-ignore
    const stream = await openai.chat.completions.create(prompt)
    let content = ''
    let seperator: undefined | string = undefined
    let numberedList: undefined | null | RegExpMatchArray = undefined

    for await (const part of stream) {
      const { delta, finish_reason } = part.choices[0]
      content += delta?.content || ''
      if (seperator === undefined && content.length > 4) {
        numberedList = content.match(/(\d+\.\s)/g)
        seperator = numberedList ? '\n' : ', '
      }

      const numberedRegex = /\d+\.\s(?:')?([^']+)(?:')?/

      if (seperator && content.includes(seperator)) {
        // get the string before the newline, and modify `content` to be the string after the newline
        // then yield the string before the newline
        const items = content.split(seperator)
        while (items.length > 1) {
          const item = items.shift()
          yield numberedList ? item?.match(numberedRegex)?.[1] as string : item as string
        }
        content = items[0]
      }
      
      if (finish_reason) yield numberedList ? content.match(numberedRegex)?.[1] as string : content ?? '' as string
    }
  }