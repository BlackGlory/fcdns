import { promises as fs } from 'fs'
import { HostnamePattern } from '@utils/hostname-pattern'

export async function readHostnameListFile(
  filename: string
): Promise<HostnamePattern[]> {
  const text = await fs.readFile(filename, 'utf-8')
  const patterns = text.split('\n')
    .map(x => x.trim())
    .filter(x => x !== '')
    .filter(isHostnamePattern)
    .map(x => new HostnamePattern(x))

  return patterns
}

function isHostnamePattern(text: string): boolean {
  return /^[\da-zA-Z\-.*]+$/.test(text)
}
