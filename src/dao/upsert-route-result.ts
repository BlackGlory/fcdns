import { getDatabase } from '@src/database'
import { RouteResult } from '@src/router'
import { withLazyStatic, lazyStatic } from 'extra-lazy'

export const upsertRouteResult = withLazyStatic(function (
  hostname: string
, routeResult: RouteResult
): void {
  lazyStatic(() => getDatabase().prepare(`
    INSERT INTO hostname (
                  hostname
                , route_result
                )
          VALUES ($hostname, $routeResult)
              ON CONFLICT(hostname)
              DO UPDATE SET route_result = $routeResult
  `), [getDatabase()]).run({ hostname, routeResult })
})
