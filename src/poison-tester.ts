import { isServerOnline } from '@utils/is-server-online'
import { createDNSResolver } from '@utils/create-dns-resolver'
import { resolveA } from '@utils/resolve-a'
import { CustomError } from '@blackglory/errors'
import { isSuccessPromise } from 'return-style'
import { Cache } from './cache'
import { isntUndefined } from '@blackglory/prelude'
import { promises as dns } from 'dns'

export class PoisonTester {
  private server: string
  private timeout: number
  private cache: Cache<boolean>
  private testResolver: dns.Resolver

  constructor(options: {
    server: string
    timeout: number
    cache: Cache<boolean>
  }) {
    this.server = options.server
    this.timeout = options.timeout
    this.cache = options.cache
    this.testResolver = createDNSResolver(this.server)
  }

  /**
   * @throws {ServerUnreachable}
   */
  async isHostnamePoisoned(hostname: string): Promise<boolean | null> {
    const result = this.cache.get(hostname)
    if (isntUndefined(result)) {
      return result
    } else {
      const [alive, poisoned] = await Promise.all([
        isServerOnline(this.server, this.timeout)
      , isSuccessPromise(resolveA(this.testResolver, hostname, this.timeout))
      ])
      if (alive) {
        this.cache.set(hostname, poisoned)
        return poisoned
      } else {
        throw new ServerUnreachable()
      }
    }
  }
}

export class ServerUnreachable extends CustomError {
  constructor() {
    super('The test server is unreachable or not sending a echo reply in time')
  }
}
