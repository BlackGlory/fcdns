import { isServerOnline } from '@utils/is-server-online'
import { createDNSResolver } from '@utils/create-dns-resolver'
import { resolveA } from '@utils/resolve-a'
import { CustomError } from '@blackglory/errors'
import { isSuccessPromise } from 'return-style'
import { isntNull } from '@blackglory/prelude'
import { promises as dns } from 'dns'
import { getPoisonResult } from '@dao/get-poison-test-result'
import { upsertPoisonTestResult } from '@dao/upsert-poison-test-result'

export enum PoisonTestResult {
  NotPoisoned = 0
, Poisoned = 1
}

export class ServerUnreachable extends CustomError {
  constructor() {
    super('The test server is unreachable or not sending a echo reply in time')
  }
}

export class PoisonTester {
  private server: string
  private timeout: number
  private testResolver: dns.Resolver

  constructor(options: {
    server: string
    timeout: number
  }) {
    this.server = options.server
    this.timeout = options.timeout
    this.testResolver = createDNSResolver(this.server)
  }

  /**
   * @throws {ServerUnreachable}
   */
  async isHostnamePoisoned(hostname: string): Promise<boolean | null> {
    const result = getPoisonResult(hostname)
    if (isntNull(result)) {
      return poisonTestResultToIsPoisoned(result)
    } else {
      const [alive, poisoned] = await Promise.all([
        isServerOnline(this.server, this.timeout)
      , isSuccessPromise(resolveA(this.testResolver, hostname, this.timeout))
      ])
      if (alive) {
        const result = poisoned
          ? PoisonTestResult.Poisoned
          : PoisonTestResult.NotPoisoned
        upsertPoisonTestResult(hostname, result)
        return poisonTestResultToIsPoisoned(result)
      } else {
        throw new ServerUnreachable()
      }
    }
  }
}

function poisonTestResultToIsPoisoned(result: PoisonTestResult): boolean {
  switch (result) {
    case PoisonTestResult.Poisoned: return true
    case PoisonTestResult.NotPoisoned: return false
    default: throw new Error('Unknown poision test result')
  }
}
