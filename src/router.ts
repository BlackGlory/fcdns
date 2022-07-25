import { promises as dns } from 'dns'
import { Tester } from './tester'
import { IPWhitelist } from './ip-whitelist'
import { HostnameList } from './hostname-list'
import { readMapFile, writeMapFile, appendMapFile } from '@utils/map-file'
import { resolveA } from '@utils/resolve-a'
import { reusePendingPromise } from 'extra-promise'

export enum RouteResult {
  UntrustedServer = 0
, TrustedServer = 1
, Unresolved = 2
}

export class Router {
  private constructor(
    private cacheFilename: string
  , private cache: Map<string, RouteResult>
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

    const cache = await readMapFile<string, RouteResult>(cacheFilename)

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

  route = reusePendingPromise(async (hostname: string): Promise<RouteResult> => {
    const result = await this.routeByLocal(hostname)
    if (result) {
      return result
    } else {
      if (this.looseMode) {
        queueMicrotask(() => this.routeByNetwork(hostname))
        return RouteResult.UntrustedServer
      } else {
        return await this.routeByNetwork(hostname)
      }
    }
  })

  private async routeByLocal(hostname: string): Promise<RouteResult | null> {
    if (this.inHostnameWhitelist(hostname)) return RouteResult.UntrustedServer
    if (this.inHostnameBlacklist(hostname)) return RouteResult.TrustedServer
    if (this.cache.has(hostname)) return this.cache.get(hostname)!

    return null
  }

  private async routeByNetwork(hostname: string): Promise<RouteResult> {
    if (await this.tester.isPoisoned(hostname)) {
      this.setCache(hostname, RouteResult.TrustedServer)
      return RouteResult.TrustedServer
    } else {
      const addresses = await resolveA(this.untrustedResolver, hostname)
      if (addresses.length > 0) {
        if (this.inIPWhitelist(addresses)) {
          this.setCache(hostname, RouteResult.UntrustedServer)
          return RouteResult.UntrustedServer
        } else {
          this.setCache(hostname, RouteResult.TrustedServer)
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
