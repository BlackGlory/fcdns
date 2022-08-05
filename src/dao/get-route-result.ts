import { getDatabase } from '@src/database'
import { RouteResult } from '@src/router'

export function getRouteResult(hostname: string): RouteResult | null {
  const row: { route_result: number | null } | undefined = getDatabase()
    .prepare(`
      SELECT route_result
        FROM hostname
       WHERE hostname = $hostname
    `)
    .get({ hostname })

  switch (row?.route_result) {
    case RouteResult.Unresolved: return RouteResult.Unresolved
    case RouteResult.TrustedServer: return RouteResult.TrustedServer
    case RouteResult.UntrustedServer: return RouteResult.UntrustedServer
    default: return null
  }
}
