import { readMapFile, writeMapFile, appendMapFile } from '@utils/map-file'
import { AsyncConstructor } from 'async-constructor'
import { isAlive } from '@utils/is-alive'
import { promises as dns } from 'dns'
import { createDNSResolver } from '@utils/create-dns-resolver'
import { resolveA } from '@utils/resolve-a'
import { CustomError } from '@blackglory/errors'
import { isSuccessPromise } from 'return-style'

export class Tester extends AsyncConstructor {
  server: string
  timeout: number
  cacheFilename: string
  testResolver: dns.Resolver
  cache!: Map<string, boolean>

  constructor(options: {
    server: string
    timeout: number
    cacheFilename: string
  }) {
    super(async () => {
      this.cache = await readMapFile(this.cacheFilename)

      // format the file
      await writeMapFile(this.cacheFilename, this.cache)
    })

    this.server = options.server
    this.timeout = options.timeout
    this.cacheFilename = options.cacheFilename
    this.testResolver = createDNSResolver(this.server)
  }

  /**
   * @throws {ServerNotAlive}
   */
  async isPoisoned(hostname: string): Promise<boolean | null> {
    if (this.cache.has(hostname)) {
      return this.cache.get(hostname)!
    } else {
      const [alive, poisoned] = await Promise.all([
        isAlive(this.server, this.timeout)
      , isSuccessPromise(resolveA(this.testResolver, hostname, this.timeout))
      ])
      if (alive) {
        this.setCache(hostname, poisoned)
        return poisoned
      } else {
        throw new ServerNotAlive()
      }
    }
  }

  private setCache(hostname: string, result: boolean): void {
    this.cache.set(hostname, result)
    appendMapFile(this.cacheFilename, hostname, result)
  }
}

export class ServerNotAlive extends CustomError {
  constructor() {
    super('The test server is not alive or not sending a echo reply in time')
  }
}
