import { getDatabase } from '@src/database.js'
import { PoisonTestResult } from '@src/poison-tester.js'
import { withLazyStatic, lazyStatic } from 'extra-lazy'

export const getPoisonResult = withLazyStatic((hostname: string): PoisonTestResult | null => {
  const row = lazyStatic(() => getDatabase()
    .prepare(`
      SELECT poison_test_result
        FROM hostname
       WHERE hostname = $hostname
    `), [getDatabase()])
    .get({ hostname }) as { poison_test_result: number | null } | undefined 

  switch (row?.poison_test_result) {
    case PoisonTestResult.Poisoned: return PoisonTestResult.Poisoned
    case PoisonTestResult.NotPoisoned: return PoisonTestResult.NotPoisoned
    default: return null
  }
})
