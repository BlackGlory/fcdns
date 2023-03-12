import { promises as fs } from 'fs'
import { HostnamePattern } from '@utils/hostname-pattern.js'
import { ensureFile } from 'extra-filesystem'

export class Hostnames {
  constructor(private patterns: HostnamePattern[]) {}

  static async fromFile(filename: string): Promise<Hostnames> {
    await ensureFile(filename)

    const text = await fs.readFile(filename, 'utf-8')
    const patterns = text.split('\n')
      .map(x => x.trim())
      .filter(x => x !== '')
      .filter(isHostnamePattern)
      .map(x => new HostnamePattern(x))

    return new Hostnames(patterns)
  }

  includes(hostname: string): boolean {
    return this.patterns.some(x => x.match(hostname))
  }
}

function isHostnamePattern(text: string): boolean {
  return /^[\da-zA-Z\-.*]+$/.test(text)
}
