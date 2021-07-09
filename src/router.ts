import { promises as dns } from 'dns'
import { Tester } from './tester'
import { Whitelist } from './whitelist'
import { AsyncConstructor } from 'async-constructor'
import { readMapFile, writeMapFile, appendMapFile } from '@utils/map-file'
import { resolveA } from '@utils/resolve-a'

export enum Target {
  Untrusted = 0
, Trusted = 1
}

export class Router extends AsyncConstructor {
  cacheFilename: string
  cache!: Map<string, Target>
  tester: Tester
  untrustedResolver: dns.Resolver
  whitelist: Whitelist

  constructor(options: {
    cacheFilename: string
    tester: Tester
    untrustedResolver: dns.Resolver
    whitelist: Whitelist
  }) {
    super(async () => {
      this.cache = await readMapFile<string, Target>(this.cacheFilename)

      // format the file
      await writeMapFile(this.cacheFilename, this.cache)
    })
    this.tester = options.tester
    this.untrustedResolver = options.untrustedResolver
    this.whitelist = options.whitelist
    this.cacheFilename = options.cacheFilename
  }

  async getTarget(hostname: string): Promise<Target> {
    if (this.cache.has(hostname)) {
      return this.cache.get(hostname)!
    } else {
      if (await this.tester.isPoisoned(hostname)) {
        this.setCache(hostname, Target.Trusted)
        return Target.Trusted
      } else {
        const addresses = await resolveA(this.untrustedResolver, hostname)
        if (addresses.length > 0) {
          if (this.inWhitelist(addresses)) {
            this.setCache(hostname, Target.Untrusted)
            return Target.Untrusted
          } else {
            this.setCache(hostname, Target.Trusted)
            return Target.Trusted
          }
        } else {
          return Target.Trusted
        }
      }
    }
  }

  private inWhitelist(addresses: string[]): boolean {
    return addresses.some(x => this.whitelist.includes(x))
  }

  private setCache(hostname: string, result: Target): void {
    this.cache.set(hostname, result)
    appendMapFile(this.cacheFilename, hostname, result)
  }
}
