import { readMapFile, writeMapFile, appendMapFile } from '@utils/map-file'
import { AsyncConstructor } from 'async-constructor'
import { promises as dns } from 'dns'
import { isAlive } from '@utils/is-alive'
import { resolveA } from '@utils/resolve-a'
import { createDNSResolver } from '@utils/create-dns-resolver'
import { CustomError } from '@blackglory/errors'
import { isSuccessPromise } from 'return-style'

export class Tester extends AsyncConstructor {
  server: string
  timeout: number
  cacheFilename: string
  resolver: dns.Resolver
  memoryCache!: Map<string, boolean>

  constructor(options: {
    server: string
    timeout: number
    cacheFilename: string
  }) {
    super(async () => {
      this.memoryCache = await readMapFile(this.cacheFilename)

      // format
      await writeMapFile(this.cacheFilename, this.memoryCache)
    })
    this.server = options.server
    this.timeout = options.timeout
    this.cacheFilename = options.cacheFilename
    this.resolver = createDNSResolver(this.server)
  }

  /**
   * @throws {ServerNotAlive}
   */
  async isPoisoned(domain: string): Promise<boolean | null> {
    if (this.memoryCache.has(domain)) {
      return this.memoryCache.get(domain)!
    } else {
      const [alive, poisoned] = await Promise.all([
        isAlive(this.server, this.timeout)
      , isSuccessPromise(resolveA(this.resolver, domain, this.timeout))
      ])
      if (alive) {
        this.cache(domain, poisoned)
        return poisoned
      } else {
        throw new ServerNotAlive()
      }
    }
  }

  private cache(domain: string, result: boolean): void {
    this.memoryCache.set(domain, result)
    appendMapFile(this.cacheFilename, domain, result)
  }
}

export class ServerNotAlive extends CustomError {
  constructor() {
    super('The test server is not alive or not sending a echo reply in time')
  }
}
