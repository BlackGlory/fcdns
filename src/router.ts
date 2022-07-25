import { promises as dns } from 'dns'
import { Tester } from './tester'
import { IPWhitelist } from './ip-whitelist'
import { HostnameList } from './hostname-list'
import { readMapFile, writeMapFile, appendMapFile } from '@utils/map-file'
import { resolveA } from '@utils/resolve-a'

export enum Target {
  Untrusted = 0
, Trusted = 1
}

export class Router {
  private constructor(
    private cacheFilename: string
  , private cache: Map<string, Target>
  , private looseMode: boolean
  , private tester: Tester
  , private untrustedResolver: dns.Resolver
  , private ipWhitelist: IPWhitelist
  , private hostnameWhitelist: HostnameList
  , private hostnameBlacklist: HostnameList
  ) {}

  static async create(options: {
    looseMode: boolean
    cacheFilename: string
    tester: Tester
    untrustedResolver: dns.Resolver
    ipWhitelist: IPWhitelist
    hostnameWhitelist: HostnameList
    hostnameBlacklist: HostnameList
  }): Promise<Router> {
    const tester = options.tester
    const untrustedResolver = options.untrustedResolver
    const ipWhitelist = options.ipWhitelist
    const hostnameWhitelist = options.hostnameWhitelist
    const hostnameBlacklist = options.hostnameBlacklist
    const cacheFilename = options.cacheFilename
    const looseMode = options.looseMode

    const cache = await readMapFile<string, Target>(cacheFilename)

    // format the file
    await writeMapFile(cacheFilename, cache)

    return new Router(
      cacheFilename
    , cache
    , looseMode
    , tester
    , untrustedResolver
    , ipWhitelist
    , hostnameWhitelist
    , hostnameBlacklist
    )
  }

  async getTarget(hostname: string): Promise<Target> {
    if (this.inHostnameWhitelist(hostname)) return Target.Untrusted
    if (this.inHostnameBlacklist(hostname)) return Target.Trusted

    if (this.cache.has(hostname)) {
      return this.cache.get(hostname)!
    } else {
      if (this.looseMode) {
        queueMicrotask(() => this.getTargetWithoutCache(hostname))
        return Target.Untrusted
      } else {
        return await this.getTargetWithoutCache(hostname)
      }
    }
  }

  private async getTargetWithoutCache(hostname: string): Promise<Target> {
    if (await this.tester.isPoisoned(hostname)) {
      this.setCache(hostname, Target.Trusted)
      return Target.Trusted
    } else {
      const addresses = await resolveA(this.untrustedResolver, hostname)
      if (addresses.length > 0) {
        if (this.inIPWhitelist(addresses)) {
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

  private inIPWhitelist(addresses: string[]): boolean {
    return addresses.some(x => this.ipWhitelist.includes(x))
  }

  private inHostnameWhitelist(hostname: string): boolean {
    return this.hostnameWhitelist.includes(hostname)
  }

  private inHostnameBlacklist(hostname: string): boolean {
    return this.hostnameBlacklist.includes(hostname)
  }

  private setCache(hostname: string, result: Target): void {
    this.cache.set(hostname, result)
    appendMapFile(this.cacheFilename, hostname, result)
  }
}
