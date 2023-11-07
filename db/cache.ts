import crypto from 'node:crypto'

export const md5 = (data: string | object) => {
  const input = typeof data === 'string' ? data : JSON.stringify(data)
  return crypto.createHash('md5').update(input).digest('hex')
}
