import { getDatabase } from '@src/database'
import { RouteResult } from '@src/router'

export function upsertRouteResult(
  hostname: string
, routeResult: RouteResult
): void {
  getDatabase().prepare(`
    INSERT INTO hostname (
                  hostname
                , route_result
                )
          VALUES ($hostname, $routeResult)
              ON CONFLICT(hostname)
              DO UPDATE SET route_result = $routeResult
  `).run({ hostname, routeResult })
}
