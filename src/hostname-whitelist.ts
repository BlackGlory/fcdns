import { AsyncConstructor } from 'async-constructor'
import { readHostnameListFile } from '@utils/hostname-list-file'
import { HostnamePattern } from '@utils/hostname-pattern'

export class HostnameWhitelist extends AsyncConstructor {
  patterns!: HostnamePattern[]

  constructor(filename: string) {
    super(async () => {
      this.patterns = await readHostnameListFile(filename)
    })
  }

  includes(hostname: string): boolean {
    return this.patterns.some(x => x.match(hostname))
  }
}
