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

// const startTime = Date.now()
// const response = await openai.createChatCompletion({
//   // model: 'gpt-3.5-turbo-0613',
//   model: 'gpt-4-0613',
//   messages: [
//     { role: 'system', content: 'You are an expert marketer.' },
//     // { role: 'user', content: 'Write an ES6 function to convert base16 to base62' },
//     // { role: 'user', content: 'Write an ES6 function to do Fizz Buzz' },
//     // { role: 'user', content: 'List 2 possible blog post titles about APIs' },
//     // { role: 'assistant', content: 'The Los Angeles Dodgers won the World Series in 2020.' },
//     // { role: 'user', content: 'Where was it played?' },
//     { role: 'user', content: 'Write a landing page for Driv.ly' },
//   ],
//   functions: [{
//     name: 'writeLandingPage',
//     // description: 'Write a landing page',
//     parameters: {
//       type: 'object',
//       properties: {
//         title: { type: 'string', description: 'The title of the landing page' },
//         description: { type: 'string', description: 'The description of the landing page' },
//         heroTitle: { type: 'string', description: 'The hero title of the landing page' },
//         heroDescription: { type: 'string', description: 'The hero description of the landing page' },
//         // features: { type: 'array', description: 'The features of the landing page' },
//         featuresTitle: { type: 'string', description: 'The features title of the landing page' },
//         featuresDescription: { type: 'string', description: 'The features description of the landing page' },
//         // features: { type: 'array', description: 'The features of the landing page' },
//       },
//       required: ['title', 'description', 'heroTitle', 'heroDescription', 'featuresTitle', 'featuresDescription',]
//     }
//   }]
  
//   // max_tokens: 7,
//   // temperature: 0,
//   // stream: true,
//   // go: true,
// })
// const completion = await response.json()
// const requestTime = Date.now() - startTime
// // console.timeEnd('openai')
// const processingTime = parseInt(response.headers.get('openai-processing-ms'))
// const latency = requestTime - processingTime
// const status = response.status

// const functionName = completion?.choices?.[0]?.message?.function_call?.name
// const args = JSON.parse(completion?.choices?.[0]?.message?.function_call?.arguments)

// console.log({ requestTime, processingTime, latency })
// console.log(completion?.choices?.[0])
// console.log(completion?.error)
// console.log({ functionName, args })

export const runtime = {

}

export const AI = (functionName, callback) => {
    runtime[functionName] = callback
}

export const getJsonSchema = propDescriptions => {
  // assume an object like this: { name: 'The name of the person', age: 'The age of the person' }
  // return an object like this: { type: 'object', properties: { name: { type: 'string', description: 'The name of the person' }, age: { type: 'number', description: 'The age of the person' } } required: ['name', 'age'] }
  const properties = Object.entries(propDescriptions).reduce((acc, [key, value]) => {
    acc[key] = { type: typeof value, description: value }
    return acc
  }
  , {})
  const required = Object.keys(properties)
  return { type: 'object', properties, required }
}