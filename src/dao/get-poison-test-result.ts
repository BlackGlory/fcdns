import { getDatabase } from '@src/database'
import { PoisonTestResult } from '@src/poison-tester'

export function getPoisonResult(hostname: string): PoisonTestResult | null {
  const row: { poison_test_result: number | null } | undefined = getDatabase()
    .prepare(`
      SELECT poison_test_result
        FROM hostname
       WHERE hostname = $hostname
    `)
    .get({ hostname })

  switch (row?.poison_test_result) {
    case PoisonTestResult.Poisoned: return PoisonTestResult.Poisoned
    case PoisonTestResult.NotPoisoned: return PoisonTestResult.NotPoisoned
    default: return null
  }
}
