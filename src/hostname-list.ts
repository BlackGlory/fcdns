import { readHostnameListFile } from '@utils/hostname-list-file'
import { HostnamePattern } from '@utils/hostname-pattern'

export class HostnameList {
  private constructor(private patterns: HostnamePattern[]) {}

  static async create(filename: string): Promise<HostnameList> {
    const patterns = await readHostnameListFile(filename)

    return new HostnameList(patterns)
  }

  includes(hostname: string): boolean {
    return this.patterns.some(x => x.match(hostname))
  }
}
