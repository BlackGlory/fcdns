import { promises as dns } from 'dns'
import { Tester } from './tester'
import { IPWhitelist } from './ip-whitelist'
import { HostnameWhitelist } from './hostname-whitelist'
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
  looseMode: boolean
  tester: Tester
  untrustedResolver: dns.Resolver
  ipWhitelist: IPWhitelist
  hostnameWhitelist: HostnameWhitelist

  constructor(options: {
    looseMode: boolean
    cacheFilename: string
    tester: Tester
    untrustedResolver: dns.Resolver
    ipWhitelist: IPWhitelist
    hostnameWhitelist: HostnameWhitelist
  }) {
    super(async () => {
      this.cache = await readMapFile<string, Target>(this.cacheFilename)

      // format the file
      await writeMapFile(this.cacheFilename, this.cache)
    })
    this.tester = options.tester
    this.untrustedResolver = options.untrustedResolver
    this.ipWhitelist = options.ipWhitelist
    this.hostnameWhitelist = options.hostnameWhitelist
    this.cacheFilename = options.cacheFilename
    this.looseMode = options.looseMode
  }

  async getTarget(hostname: string): Promise<Target> {
    if (this.inHostnameWhitelist(hostname)) return Target.Untrusted

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

  async getTargetWithoutCache(hostname: string): Promise<Target> {
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

  private setCache(hostname: string, result: Target): void {
    this.cache.set(hostname, result)
    appendMapFile(this.cacheFilename, hostname, result)
  }
}
