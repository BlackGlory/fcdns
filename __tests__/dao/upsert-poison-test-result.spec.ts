import { upsertPoisonTestResult } from '@dao/upsert-poison-test-result.js'
import { initializeDatabase, clearDatabase, getRawHostname, setRawHostname } from './utils.js'
import { PoisonTestResult } from '@src/poison-tester.js'
import { RouteResult } from '@src/router.js'

beforeEach(initializeDatabase)
afterEach(clearDatabase)

describe('upsertPoisonTestResult', () => {
  test('item does not exist', () => {
    const hostname = 'hostname'

    upsertPoisonTestResult(hostname, PoisonTestResult.NotPoisoned)

    expect(getRawHostname(hostname)).toEqual({
      hostname
    , route_result: null
    , poison_test_result: PoisonTestResult.NotPoisoned
    })
  })

  test('item exists', () => {
    const hostname = 'hostname'
    setRawHostname({
      hostname
    , route_result: RouteResult.UntrustedServer
    , poison_test_result: PoisonTestResult.NotPoisoned
    })

    upsertPoisonTestResult(hostname, PoisonTestResult.Poisoned)

    expect(getRawHostname(hostname)).toEqual({
      hostname
    , route_result: RouteResult.UntrustedServer
    , poison_test_result: PoisonTestResult.Poisoned
    })
  })
})
