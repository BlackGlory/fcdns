import { promises as dns } from 'dns'
import { Tester } from './tester'
import { IPWhitelist } from './ip-whitelist'
import { HostnameList } from './hostname-list'
import { readMapFile, writeMapFile, appendMapFile } from '@utils/map-file'
import { resolveA } from '@utils/resolve-a'
import { go } from '@blackglory/prelude'

export enum RouteResult {
  UntrustedServer = 0
, TrustedServer = 1
, Unresolved = 2
}

export class Router {
  private constructor(
    private cacheFilename: string
  , private cache: Map<string, RouteResult>
  , private tester: Tester
  , private untrustedResolver: dns.Resolver
  , private ipWhitelist: IPWhitelist
  , private hostnameWhitelist: HostnameList
  , private hostnameBlacklist: HostnameList
  ) {}

  static async create(options: {
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

    const cache = await readMapFile<string, RouteResult>(cacheFilename)

    // rewrite the file for compression
    await writeMapFile(cacheFilename, cache)

    return new Router(
      cacheFilename
    , cache
    , tester
    , untrustedResolver
    , ipWhitelist
    , hostnameWhitelist
    , hostnameBlacklist
    )
  }

  async route(hostname: string): Promise<RouteResult> {
    const result = this.routeByLocal(hostname)
    switch (result) {
      case RouteResult.UntrustedServer:
      case RouteResult.TrustedServer:
        return result
      default: return await go(async () => {
        const result = await this.routeByNetwork(hostname)
        switch (result) {
          case RouteResult.UntrustedServer:
          case RouteResult.TrustedServer:
            this.setCache(hostname, result)
          default: return result
        }
      })
    }
  }

  private routeByLocal(hostname: string): RouteResult {
    if (this.inHostnameWhitelist(hostname)) return RouteResult.UntrustedServer
    if (this.inHostnameBlacklist(hostname)) return RouteResult.TrustedServer
    if (this.cache.has(hostname)) return this.cache.get(hostname)!
    return RouteResult.Unresolved
  }

  private async routeByNetwork(hostname: string): Promise<RouteResult> {
    if (await this.tester.isPoisoned(hostname)) {
      return RouteResult.TrustedServer
    } else {
      const addresses = await resolveA(this.untrustedResolver, hostname)
      if (addresses.length > 0) {
        if (this.inIPWhitelist(addresses)) {
          return RouteResult.UntrustedServer
        } else {
          return RouteResult.TrustedServer
        }
      } else {
        // 该主机名没有A记录.
        return RouteResult.Unresolved
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

  private setCache(hostname: string, result: RouteResult): void {
    this.cache.set(hostname, result)
    appendMapFile(this.cacheFilename, hostname, result)
  }
}
