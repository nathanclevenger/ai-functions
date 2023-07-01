import { Configuration, OpenAIApi } from 'openai-edge'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  basePath: 'https://aihooks.dev/v1',
  baseOptions: {
    headers: {
      'webhook-app-id': process.env.AIHOOKS_APP_ID
    }
  }
})
const openai = new OpenAIApi(configuration)

const startTime = Date.now()
const response = await openai.createChatCompletion({
  model: 'gpt-3.5-turbo-0613',
  // model: 'gpt-4-0613',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    // { role: 'user', content: 'Write an ES6 function to convert base16 to base62' },
    { role: 'user', content: 'Write an ES6 function to do Fizz Buzz' },
    // { role: 'user', content: 'List 2 possible blog post titles about APIs' },
    // { role: 'assistant', content: 'The Los Angeles Dodgers won the World Series in 2020.' },
    // { role: 'user', content: 'Where was it played?' },
  ],
  // max_tokens: 7,
  // temperature: 0,
  // stream: true,
  // go: true,
})
const completion = await response.json()
const requestTime = Date.now() - startTime
// console.timeEnd('openai')
const processingTime = parseInt(response.headers.get('openai-processing-ms'))
const latency = requestTime - processingTime
const status = response.status
console.log({ requestTime, processingTime, latency })
console.log(completion?.choices?.[0])
console.log(completion?.error)

export const runtime = {

}

export const AI = (functionName, callback) => {
    runtime[functionName] = callback
}