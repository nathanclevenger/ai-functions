import { ClientOptions, OpenAI,  } from 'openai'
import { ChatCompletion, ChatCompletionCreateParamsBase } from 'openai/resources/chat/completions'
// import { AIDB, AIDBConfig } from '../db/mongo'
import { dump } from 'js-yaml'
import { generateSchema } from '../utils/schema'
import { FromSchema } from 'json-schema-to-ts'
import { GPT } from './gpt'
import { StreamingList } from './list'

export type AIConfig = ClientOptions & {
  // db?: AIDBConfig
  openai?: OpenAI
  system?: string
  model?: ChatCompletionCreateParamsBase['model']
}

export type FunctionCallOptions = Omit<ChatCompletionCreateParamsBase, 'messages' | 'stream' > & {
  system?: string
  meta?: boolean
  description?: string
}

type AIFunctions<T = Record<string,string>> = Record<string, (
    returnSchema: T, 
    options?: Partial<FunctionCallOptions>
  ) => (
    args: string | object, 
    callOptions?: Partial<FunctionCallOptions>
  ) => Promise<T>
>

export const AI = (config: AIConfig = {}) => {
  const { model = 'gpt-4-turbo-preview', system, ...rest } = config 
  const openai = config.openai ?? new OpenAI(rest)
  const { gpt } = GPT(config)
  const { list } = StreamingList(config)
  // const { client, db, cache, events, queue } = config.db ? AIDB(config.db) : {}
  // const prompt = {
  //   model,
  //   messages: [{ role: 'user', content: user }],
  // }
  // if (system) prompt.messages.unshift({ role: 'system', content: system })
  // const messages = system ? [{ role: 'system', content: system }] : []  
  // const completion = openai.chat.completions.create({
  //   model,
  //   messages: [{ role: 'user', content: 'hello' }],
  // })

  const ai: AIFunctions = new Proxy(
    {} as Record<string, any>,
    {
      get: (target, functionName: string, receiver) => {
        target[functionName] = (returnSchema: Record<string,any>, options: FunctionCallOptions) => async (args: string | object, callOptions?: FunctionCallOptions) => {
          console.log(generateSchema(returnSchema))
          const { system, description, model = config.model ?? 'gpt-4-turbo-preview', meta = false, ...rest } = { ...options, ...callOptions }
          const prompt: ChatCompletionCreateParamsBase = {
            model,
            messages: [
              {
                role: 'user',
                content: `Call ${functionName} given the context:\n${dump(args)}`,
              }, // \nThere is no additional information, so make assumptions/guesses as necessary` },
            ],

            tools: [
              {
                type: 'function',
                function: {
                  name: functionName,
                  description,
                  parameters: generateSchema(returnSchema) as Record<string,unknown>,
                }
              }
            ],

            tool_choice: { 
              type: 'function',
              function: { name: functionName }
            },

            ...rest,
          }
          if (system) prompt.messages.unshift({ role: 'system', content: system })
          const completion = await openai.chat.completions.create(prompt) as ChatCompletion
          const schema = generateSchema(returnSchema)
          let data: FromSchema<typeof schema>
          let error
          const { message } = completion.choices?.[0]
          console.log({ message })
          prompt.messages.push(message)
          const { content, tool_calls } = message
          if (tool_calls) {
            try {
              data = JSON.parse(tool_calls[0].function.arguments)
            } catch (err: any) {
              error = err.message
            }
          }
          const gpt4 = model.includes('gpt-4')
          const cost = completion.usage ? 
            Math.round(
              (gpt4
                ? completion.usage.prompt_tokens * 0.003 + completion.usage.completion_tokens * 0.006
                : completion.usage.prompt_tokens * 0.00015 + completion.usage.completion_tokens * 0.0002) * 100000
            ) / 100000 : undefined
          // completion.usage = camelcaseKeys(completion.usage)
          console.log({ data, content, error, cost, usage: completion.usage })
          return meta ? { prompt, content, data, error, cost, ...completion } : data ?? content
        }
        return target[functionName]
      },
    }
  )
  return { ai, openai, gpt, list } //, client, db, cache, events, queue }
}
