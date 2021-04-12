import { RecordWithTtl, promises as dns } from 'dns'
import { ILogger } from 'extra-logger'
import { Tester } from './tester'
import { Whitelist } from './whitelist'
import { AsyncConstructor } from 'async-constructor'
import { readMapFile, writeMapFile, appendMapFile } from '@utils/map-file'
import { countup } from '@utils/countup'
import { resolveA } from '@utils/resolve-a'
import chalk from 'chalk'
import { getErrorResultPromise } from 'return-style'
import { isntUndefined } from '@blackglory/types'
import { go } from '@blackglory/go'

enum Kind {
  Untrusted = 0
, Trusted = 1
}

export class Router extends AsyncConstructor {
  cacheFilename: string
  route = new Map<string, Kind>()
  tester: Tester
  untrustedResolver: dns.Resolver
  trustedResolver: dns.Resolver
  whitelist: Whitelist
  logger: ILogger

  constructor(options: {
    cacheFilename: string
    tester: Tester
    untrustedResolver: dns.Resolver
    trustedResolver: dns.Resolver
    whitelist: Whitelist
    logger: ILogger
  }) {
    super(async () => {
      this.route = await readMapFile<string, Kind>(this.cacheFilename)

      // format
      await writeMapFile(this.cacheFilename, this.route)
    })
    this.tester = options.tester
    this.untrustedResolver = options.untrustedResolver
    this.trustedResolver = options.trustedResolver
    this.whitelist = options.whitelist
    this.logger = options.logger
    this.cacheFilename = options.cacheFilename
  }

  async resolveA(domain: string): Promise<RecordWithTtl[]> {
    const id = countup()
    this.trace(id, domain, 'Begin')
    const startTime = getTimestamp()

    const [err, records] = await getErrorResultPromise(go(async () => {
      if (this.route.has(domain)) {
        switch (this.route.get(domain)!) {
          case Kind.Untrusted:
            this.debug(id, domain, `Hit the route cache (untrusted server)`)

            return await this.resolveByUntrustedDNS(id, domain)
          case Kind.Trusted:
            this.debug(id, domain, `Hit the route cache (trusted server)`)

            return await this.resolveByTrustedDNS(id, domain)
        }
      } else {
        const startTime = Date.now()
        if (await this.tester.isPoisoned(domain)) {
          this.debug(id, domain, chalk.magenta`Poisoned`, getElapsed(startTime))

          this.cache(domain, Kind.Trusted)

          return await this.resolveByTrustedDNS(id, domain)
        } else {
          this.debug(id, domain, `Not poisoned`, getElapsed(startTime))

          const records = await this.resolveByUntrustedDNS(id, domain)
          if (records.length > 0) {
            const startTime = getTimestamp()

            const inWhitelist = records.some(x => this.whitelist.includes(x.address))

            if (inWhitelist) {
              this.debug(id, domain, 'In the whitelist', getElapsed(startTime))

              this.cache(domain, Kind.Untrusted)
              return records
            } else {
              this.debug(id, domain, 'Not in the whitelist', getElapsed(startTime))

              this.cache(domain, Kind.Trusted)
              return await this.resolveByTrustedDNS(id, domain)
            }
          } else {
            return []
          }
        }
      }
    }))

    this.trace(id, domain, 'End', getElapsed(startTime))
    if (err) {
      this.logRejected(id, domain, err, getElapsed(startTime))
      return []
    } else {
      this.logResolved(id, domain, records!, getElapsed(startTime))
      return records!
    }
  }

  private cache(domain: string, result: Kind): void {
    this.route.set(domain, Kind.Trusted)
    appendMapFile(this.cacheFilename, domain, result)
  }

  private async resolveByUntrustedDNS(id: number, domain: string): Promise<RecordWithTtl[]> {
    const startTime = getTimestamp()

    const records = await resolveA(this.untrustedResolver, domain)

    this.debug(id, domain, 'Resolved by the untrusted server', getElapsed(startTime))

    return records
  }

  private async resolveByTrustedDNS(id: number, domain: string): Promise<RecordWithTtl[]> {
    const startTime = getTimestamp()

    const records = await resolveA(this.trustedResolver, domain)

    this.debug(id, domain, 'Resolved by the trusted server', getElapsed(startTime))

    return records
  }

  trace(id: number, hostname: string, message: string, elapsed?: number): void {
    const prefix = createPrefix(id, hostname)
    const postfix = isntUndefined(elapsed) ? ' ' + formatElapsedTime(elapsed) : ''
    this.logger.trace(`${prefix} ${message}` + postfix)
  }

  logRejected(id: number, hostname: string, error: any, elapsed: number): void {
    const message = chalk.red(error.code ?? `${error}`)
    const prefix = createPrefix(id, hostname)
    const postfix = formatElapsedTime(elapsed)
    this.logger.error(`${prefix} ${message} ${postfix}`)
  }

  logResolved(id: number, hostname: string, records: RecordWithTtl[], elapsed: number): void {
    const message = `[${records.map(x => `${x.address} (TTL: ${x.ttl})`).join(', ')}]`
    const prefix = createPrefix(id, hostname)
    const postfix = formatElapsedTime(elapsed)
    this.logger.info(`${prefix} ${message} ${postfix}`)
  }

  debug(id: number, hostname: string, message: string, elapsed?: number): void {
    const prefix = createPrefix(id, hostname)
    const postfix = isntUndefined(elapsed) ? ' ' + formatElapsedTime(elapsed) : ''
    this.logger.debug(`${prefix} ${message}` + postfix)
  }
}

function createPrefix(id: number, hostname: string): string {
  return `[${formatDate(Date.now())}] #${id} ${formatHostname(hostname)}`
}

function formatHostname(hostname: string): string {
  return chalk.cyan(hostname)
}

function formatElapsedTime(elapsed: number): string {
  if (elapsed <= 100) {
    return chalk.green`${elapsed}ms`
  } else if (elapsed <= 300) {
    return chalk.yellow`${elapsed}ms`
  } else {
    return chalk.red`${elapsed}ms`
  }
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

function getTimestamp(): number {
  return Date.now()
}

function getElapsed(startTime: number): number {
  return getTimestamp() - startTime
}
