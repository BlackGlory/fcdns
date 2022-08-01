import { promises as dns } from 'dns'
import { PoisonTester } from './poison-tester'
import { IPRanges } from './ip-ranges'
import { Hostnames } from './hostnames'
import { Cache } from './cache'
import { resolveA } from '@utils/resolve-a'
import { go, isntUndefined } from '@blackglory/prelude'

export enum RouteResult {
  UntrustedServer = 0
, TrustedServer = 1
, Unresolved = 2
}

export class Router {
  private cache: Cache<RouteResult>
  private poisonTester: PoisonTester
  private untrustedResolver: dns.Resolver
  private ipWhitelist: IPRanges
  private hostnameWhitelist: Hostnames
  private hostnameBlacklist: Hostnames

  constructor(options: {
    cache: Cache<RouteResult>
    poisonTester: PoisonTester
    untrustedResolver: dns.Resolver
    ipWhitelist: IPRanges
    hostnameWhitelist: Hostnames
    hostnameBlacklist: Hostnames
  }) {
    this.cache = options.cache
    this.poisonTester = options.poisonTester
    this.untrustedResolver = options.untrustedResolver
    this.ipWhitelist = options.ipWhitelist
    this.hostnameWhitelist = options.hostnameWhitelist
    this.hostnameBlacklist = options.hostnameBlacklist
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
            this.cache.set(hostname, result)
          default: return result
        }
      })
    }
  }

  private routeByLocal(hostname: string): RouteResult {
    if (this.inHostnameWhitelist(hostname)) return RouteResult.UntrustedServer
    if (this.inHostnameBlacklist(hostname)) return RouteResult.TrustedServer

    const result = this.cache.get(hostname)
    if (isntUndefined(result)) {
      return result
    } else {
      return RouteResult.Unresolved
    }
  }

  private async routeByNetwork(hostname: string): Promise<RouteResult> {
    if (await this.poisonTester.isHostnamePoisoned(hostname)) {
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
}
