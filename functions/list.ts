import { GPTConfig } from '../types'
import { chatCompletion } from '../utils/completion'

export const List = (config: GPTConfig) => {
  const list = async (strings: string[], ...values: string[]) => {
    const user =
      values.map((value, i) => strings[i] + value).join('') +
      strings[strings.length - 1]
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
