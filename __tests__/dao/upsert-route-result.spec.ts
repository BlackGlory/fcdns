import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { upsertRouteResult } from '@dao/upsert-route-result.js'
import { initializeDatabase, clearDatabase, getRawHostname, setRawHostname } from './utils.js'
import { RouteResult } from '@src/router.js'
import { PoisonTestResult } from '@src/poison-tester.js'

beforeEach(initializeDatabase)
afterEach(clearDatabase)

describe('upsertRouteResult', () => {
  test('item does not exist', () => {
    const hostname = 'hostname'

    upsertRouteResult(hostname, RouteResult.TrustedServer)

    expect(getRawHostname(hostname)).toEqual({
      hostname
    , route_result: RouteResult.TrustedServer
    , poison_test_result: null
    })
  })

  test('item exists', () => {
    const hostname = 'hostname'
    setRawHostname({
      hostname
    , route_result: RouteResult.UntrustedServer
    , poison_test_result: PoisonTestResult.NotPoisoned
    })

    upsertRouteResult(hostname, RouteResult.TrustedServer)

    expect(getRawHostname(hostname)).toEqual({
      hostname
    , route_result: RouteResult.TrustedServer
    , poison_test_result: PoisonTestResult.NotPoisoned
    })
  })
})
