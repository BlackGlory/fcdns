import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { getPoisonResult } from '@dao/get-poison-test-result.js'
import { initializeDatabase, clearDatabase, setRawHostname } from './utils.js'
import { PoisonTestResult } from '@src/poison-tester.js'
import { RouteResult } from '@src/router.js'

beforeEach(initializeDatabase)
afterEach(clearDatabase)

describe('getPoisonTestResult', () => {
  test('item does not exist', () => {
    const hostname = 'hostname'

    const result = getPoisonResult(hostname)

    expect(result).toBe(null)
  })

  describe('item exists', () => {
    test('non-null', () => {
      const hostname = 'hostname'
      setRawHostname({
        hostname
      , route_result: null
      , poison_test_result: PoisonTestResult.NotPoisoned
      })

      const result = getPoisonResult(hostname)

      expect(result).toStrictEqual(PoisonTestResult.NotPoisoned)
    })

    test('null', () => {
      const hostname = 'hostname'
      setRawHostname({
        hostname
      , route_result: RouteResult.TrustedServer
      , poison_test_result: null
      })

      const result = getPoisonResult(hostname)

      expect(result).toStrictEqual(null)
    })
  })
})
