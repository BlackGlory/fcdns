import { readHostnameListFile } from '@utils/hostname-list-file'
import { HostnamePattern } from '@utils/hostname-pattern'

export class HostnameWhitelist {
  private constructor(private patterns: HostnamePattern[]) {}

  static async create(filename: string): Promise<HostnameWhitelist> {
    const patterns = await readHostnameListFile(filename)

    return new HostnameWhitelist(patterns)
  }

  includes(hostname: string): boolean {
    return this.patterns.some(x => x.match(hostname))
  }
}
