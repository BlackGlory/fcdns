import { getDatabase } from '@src/database.js'
import { RouteResult } from '@src/router.js'
import { withLazyStatic, lazyStatic } from 'extra-lazy'

export const upsertRouteResult = withLazyStatic(function (
  hostname: string
, routeResult: RouteResult
): void {
  lazyStatic(() => getDatabase()
    .prepare<
      {
        hostname: string
        routeResult: RouteResult
      }
    >(`
      INSERT INTO hostname (
                    hostname
                  , route_result
                  )
            VALUES ($hostname, $routeResult)
                ON CONFLICT(hostname)
                DO UPDATE SET route_result = $routeResult
    `), [getDatabase()])
    .run({ hostname, routeResult })
})
