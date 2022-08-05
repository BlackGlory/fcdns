import { getDatabase } from '@src/database'
import { PoisonTestResult } from '@src/poison-tester'

export function upsertPoisonTestResult(
  hostname: string
, result: PoisonTestResult
): void {
  getDatabase().prepare(`
    INSERT INTO hostname (
                  hostname
                , poison_test_result
                )
          VALUES ($hostname, $result)
              ON CONFLICT(hostname)
              DO UPDATE SET poison_test_result = $result
  `).run({ hostname, result })
}
