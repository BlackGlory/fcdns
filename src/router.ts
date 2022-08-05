import { promises as dns } from 'dns'
import { PoisonTester } from './poison-tester'
import { IPRanges } from './ip-ranges'
import { Hostnames } from './hostnames'
import { resolveA } from '@utils/resolve-a'
import { isntNull } from '@blackglory/prelude'
import { getRouteResult } from '@dao/get-route-result'
import { upsertRouteResult } from '@dao/upsert-route-result'

export enum RouteResult {
  UntrustedServer = 0
, TrustedServer = 1
, Unresolved = 2
}

export class Router {
  private poisonTester: PoisonTester
  private untrustedResolver: dns.Resolver
  private ipWhitelist: IPRanges
  private hostnameWhitelist: Hostnames
  private hostnameBlacklist: Hostnames

  constructor(options: {
    poisonTester: PoisonTester
    untrustedResolver: dns.Resolver
    ipWhitelist: IPRanges
    hostnameWhitelist: Hostnames
    hostnameBlacklist: Hostnames
  }) {
    this.poisonTester = options.poisonTester
    this.untrustedResolver = options.untrustedResolver
    this.ipWhitelist = options.ipWhitelist
    this.hostnameWhitelist = options.hostnameWhitelist
    this.hostnameBlacklist = options.hostnameBlacklist
  }

  async route(hostname: string): Promise<RouteResult> {
    if (this.inHostnameWhitelist(hostname)) return RouteResult.UntrustedServer
    if (this.inHostnameBlacklist(hostname)) return RouteResult.TrustedServer

    const result = getRouteResult(hostname)
    if (isntNull(result)) {
      return result
    } else {
      const result = await this.resolveRoute(hostname)
      upsertRouteResult(hostname, result)
      return result
    }
  }

  private async resolveRoute(hostname: string): Promise<RouteResult> {
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
        // 该主机名未被污染, 但没有A记录, 因此无法决定路由结果, 交由使用结果者决定如何路由.
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
