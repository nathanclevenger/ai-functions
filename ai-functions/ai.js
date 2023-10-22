import { OpenAI } from 'openai'
// import camelcaseKeys from 'camelcase-keys'
import { dump } from 'js-yaml'
import { schema } from './schema.js'

export const AI = opts => {
  const { system, model = 'gpt-3.5-turbo', apiKey, OPENAI_API_KEY, ...rest } = opts || {}

  // const openai = new OpenAI({ apiKey: apiKey ?? OPENAI_API_KEY, ...rest })

  const gpt = async (strings, ...values) => {
    const user = values.map((value, i) => strings[i] + value).join('') + strings[strings.length - 1]
    const prompt = {
      model,
      messages: [
        { role: 'user', content: user },
      ],
    }
    if (system) prompt.messages.unshift({ role: 'system', content: system })
    const completion = await openai.chat.completions.create(prompt)
    return completion.choices?.[0].message.content
  }

  const ai = new Proxy({}, {
    get: (target, functionName, receiver) => {
      return async (args, returnSchema, options) => {
        console.log(schema(returnSchema))
        const { system, description, model = 'gpt-3.5-turbo', meta = false, ...rest } = options || {}
        const prompt = {
          model,
          messages: [
            { role: 'user', content: `Call ${functionName} given the context:\n${dump(args)}` }, // \nThere is no additional information, so make assumptions/guesses as necessary` },
          ],
          functions: [{ 
            name: functionName, 
            description, 
            parameters: schema(returnSchema),
          }],
          ...rest,
        }
        if (system) prompt.messages.unshift({ role: 'system', content: system })
        const completion = await openai.chat.completions.create(prompt)
        let data, error
        const { message } = completion.choices?.[0]
        prompt.messages.push(message)
        const { content, function_call } = message
        if (function_call) {
          try {
            data = JSON.parse(function_call.arguments)
          } catch (err) {
            error = err.message
          }
        }
        const gpt4 = model.includes('gpt-4')
        const cost = Math.round((gpt4 
          ? completion.usage.prompt_tokens * 0.003 + completion.usage.completion_tokens * 0.006 
          : completion.usage.prompt_tokens * 0.00015 + completion.usage.completion_tokens * 0.0002) * 100000) / 100000
        completion.usage = camelcaseKeys(completion.usage)
        console.log({ data, content, error, cost })
        return meta ? { prompt, content, data, error, cost, ...completion } : data ?? content
      }
    }
  })

  async function* list(strings, ...values) {
    const listPrompt = values.map((value, i) => strings[i] + value).join('') + strings[strings.length - 1]
    const prompt = {
      model,
      messages: [{ role: 'user', content: 'List ' + listPrompt }],
      stream: true,
    }
    if (system) prompt.messages.unshift({ role: 'system', content: system })
    const stream = await openai.chat.completions.create(prompt)
    let content = ''
    let seperator = undefined
    let numberedList = undefined

    for await (const part of stream) {
      const { delta, finish_reason } = part.choices[0]
      content += delta?.content || ''
      if (seperator === undefined && content.length > 4) {
        numberedList = content.match(/(\d+\.\s)/g)
        seperator = numberedList ? '\n' : ', '
      }

      const numberedRegex = /\d+\.\s(?:")?([^"]+)(?:")?/

      if (content.includes(seperator)) {
        // get the string before the newline, and modify `content` to be the string after the newline
        // then yield the string before the newline
        const items = content.split(seperator)
        while (items.length > 1) {
          const item = items.shift()
          yield numberedList ? item.match(numberedRegex)?.[1] : item
        }
        content = items[0]
      }

      if (finish_reason) yield numberedList ? content.match(numberedRegex)?.[1] : content
    }
    
  }

  return { ai, list, gpt, openai }
}