import { readMapFile, writeMapFile, appendMapFile } from '@utils/map-file'
import { isAlive } from '@utils/is-alive'
import { promises as dns } from 'dns'
import { createDNSResolver } from '@utils/create-dns-resolver'
import { resolveA } from '@utils/resolve-a'
import { CustomError } from '@blackglory/errors'
import { isSuccessPromise } from 'return-style'

export class Tester {
  private constructor(
    private server: string
  , private timeout: number
  , private cacheFilename: string
  , private testResolver: dns.Resolver
  , private cache: Map<string, boolean>
  ) {}

  static async create(options: {
    server: string
    timeout: number
    cacheFilename: string
  }): Promise<Tester> {
    const server = options.server
    const timeout = options.timeout
    const cacheFilename = options.cacheFilename
    const testResolver = createDNSResolver(server)
    const cache = await readMapFile<string, boolean>(cacheFilename)

    // format the file
    await writeMapFile(cacheFilename, cache)

    return new Tester(server, timeout, cacheFilename, testResolver, cache)
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
