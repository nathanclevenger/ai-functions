import { GPTConfig } from '../types'
import { chatCompletion } from '../utils/completion'

export const GPT = (config: GPTConfig) => {
  const gpt = async (strings: string[], ...values: string[]) => {
    const user = values.map((value, i) => strings[i] + value).join('') + strings[strings.length - 1]
    const completion = await chatCompletion({ user, ...config })
    const content = completion.choices?.[0].message.content
    return content
  }
  return { gpt }
}
