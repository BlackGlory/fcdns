import { getPoisonResult } from '@dao/get-poison-test-result'
import { initializeDatabase, clearDatabase, setRawHostname } from './utils'
import { PoisonTestResult } from '@src/poison-tester'
import { RouteResult } from '@src/router'

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
