import { getDatabase } from '@src/database'
import { RouteResult } from '@src/router'
import { withLazyStatic, lazyStatic } from 'extra-lazy'

export const getRouteResult = withLazyStatic(function (hostname: string): RouteResult | null {
  const row: { route_result: number | null } | undefined = lazyStatic(() => getDatabase()
    .prepare(`
      SELECT route_result
        FROM hostname
       WHERE hostname = $hostname
    `), [getDatabase()])
    .get({ hostname })

  switch (row?.route_result) {
    case RouteResult.Unresolved: return RouteResult.Unresolved
    case RouteResult.TrustedServer: return RouteResult.TrustedServer
    case RouteResult.UntrustedServer: return RouteResult.UntrustedServer
    default: return null
  }
})
