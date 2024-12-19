import { getDatabase } from '@src/database.js'
import { RouteResult } from '@src/router.js'
import { withLazyStatic, lazyStatic } from 'extra-lazy'

export const getRouteResult = withLazyStatic((hostname: string): RouteResult | null => {
  const row = lazyStatic(() => getDatabase()
    .prepare<
      { hostname: string }
    , { route_result: number | null }
    >(`
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
