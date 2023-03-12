import { getDatabase } from '@src/database.js'
import { PoisonTestResult } from '@src/poison-tester.js'
import { withLazyStatic, lazyStatic } from 'extra-lazy'

export const upsertPoisonTestResult = withLazyStatic(function (
  hostname: string
, result: PoisonTestResult
): void {
  lazyStatic(() => getDatabase().prepare(`
    INSERT INTO hostname (
                  hostname
                , poison_test_result
                )
          VALUES ($hostname, $result)
              ON CONFLICT(hostname)
              DO UPDATE SET poison_test_result = $result
  `), [getDatabase()]).run({ hostname, result })
})
