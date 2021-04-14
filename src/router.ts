import { RecordWithTtl, promises as dns } from 'dns'
import { Tester } from './tester'
import { Whitelist } from './whitelist'
import { AsyncConstructor } from 'async-constructor'
import { readMapFile, writeMapFile, appendMapFile } from '@utils/map-file'
import { countup } from '@utils/countup'
import { resolveA } from '@utils/resolve-a'
import { getErrorResultAsync } from 'return-style'
import { isntUndefined } from '@blackglory/types'
import { getTimestamp } from '@utils/get-timestamp'
import { getElapsed } from '@utils/get-elapsed'
import { createRouteLogger } from './logger'
import { IMessageLog, IErrorLog } from './logger'
import chalk from 'chalk'

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
  logger: ReturnType<typeof createRouteLogger>

  constructor(options: {
    cacheFilename: string
    tester: Tester
    untrustedResolver: dns.Resolver
    trustedResolver: dns.Resolver
    whitelist: Whitelist
    logger: ReturnType<typeof createRouteLogger>
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

  async resolveA(hostname: string): Promise<RecordWithTtl[]> {
    const id = countup().toString()
    const startTime = getTimestamp()
    this.logger.trace(message('Begin'))

    const [err, records] = await getErrorResultAsync(async () => {
      if (this.route.has(hostname)) {
        const kind = this.route.get(hostname)!
        switch (kind) {
          case Kind.Untrusted:
            this.logger.debug(message('Hit the route cache (untrusted server)'))
            return await this.resolveAByUntrustedDNS(id, hostname)
          case Kind.Trusted:
            this.logger.debug(message('Hit the route cache (trusted server)'))
            return await this.resolveAByTrustedDNS(id, hostname)
        }
      } else {
        const startTime = getTimestamp()
        if (await this.tester.isPoisoned(hostname)) {
          this.logger.debug(message(chalk.magenta`Poisoned`, startTime))
          this.cache(hostname, Kind.Trusted)
          return await this.resolveAByTrustedDNS(id, hostname)
        } else {
          this.logger.debug(message('Not poisoned', startTime))
          const records = await this.resolveAByUntrustedDNS(id, hostname)
          if (records.length > 0) {
            const startTime = getTimestamp()
            if (this.inWhitelist(records)) {
              this.logger.debug(message('In the whitelist', startTime))
              this.cache(hostname, Kind.Untrusted)
              return records
            } else {
              this.logger.debug(message('Not in the whitelist', startTime))
              this.cache(hostname, Kind.Trusted)
              return await this.resolveAByTrustedDNS(id, hostname)
            }
          } else {
            return []
          }
        }
      }
    })

    this.logger.trace(message('End', startTime))
    if (err) {
      this.logger.error(createRejectionLog)
      return []
    } else {
      this.logger.info(createResolutionLog)
      return records!
    }

    function message(message: string, startTime?: number): () => IMessageLog {
      return () => {
        const elapsed = isntUndefined(startTime) ? getElapsed(startTime) : undefined
        return {
          id
        , timestamp: getTimestamp()
        , hostname
        , message
        , elapsed
        }
      }
    }

    function createResolutionLog(): IMessageLog {
      const message = `[${records!.map(x => `${x.address} (TTL: ${x.ttl})`).join(', ')}]`
      return {
        id
      , hostname
      , message
      , timestamp: getTimestamp()
      , elapsed: getElapsed(startTime)
      }
    }

    function createRejectionLog(): IErrorLog {
      const error = err as any
      const reason = chalk.red(error && error.code ? `${error.code}` : `${error}`)
      return {
        id
      , hostname
      , reason
      , timestamp: getTimestamp()
      , elapsed: getElapsed(startTime)
      }
    }
  }

  private inWhitelist(records: RecordWithTtl[]): boolean {
    return records.some(x => this.whitelist.includes(x.address))
  }

  private cache(domain: string, result: Kind): void {
    this.route.set(domain, Kind.Trusted)
    appendMapFile(this.cacheFilename, domain, result)
  }

  private async resolveAByUntrustedDNS(
    id: string
  , hostname: string
  ): Promise<RecordWithTtl[]> {
    const startTime = getTimestamp()

    const records = await resolveA(this.untrustedResolver, hostname)
    this.logger.debug(createLog)

    return records

    function createLog(): IMessageLog {
      return {
        id
      , timestamp: startTime
      , hostname
      , message: 'Resolved by the untrusted server'
      , elapsed: getElapsed(startTime)
      }
    }
  }

  private async resolveAByTrustedDNS(
    id: string
  , hostname: string
  ): Promise<RecordWithTtl[]> {
    const startTime = getTimestamp()

    const records = await resolveA(this.trustedResolver, hostname)
    this.logger.debug(createLog)

    return records

    function createLog(): IMessageLog {
      return {
        id
      , timestamp: startTime
      , hostname
      , message: 'Resolved by the trusted server'
      , elapsed: getElapsed(startTime)
      }
    }
  }
}
