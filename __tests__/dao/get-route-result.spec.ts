import { getRouteResult } from '@dao/get-route-result.js'
import { initializeDatabase, clearDatabase, setRawHostname } from './utils.js'
import { RouteResult } from '@src/router.js'
import { PoisonTestResult } from '@src/poison-tester.js'

beforeEach(initializeDatabase)
afterEach(clearDatabase)

describe('getRouteResult', () => {
  test('item does not exist', () => {
    const hostname = 'hostname'

    const result = getRouteResult(hostname)

    expect(result).toBe(null)
  })

  describe('item exists', () => {
    test('non-null', () => {
      const hostname = 'hostname'
      setRawHostname({
        hostname
      , route_result: RouteResult.UntrustedServer
      , poison_test_result: null
      })

      const result = getRouteResult(hostname)

      expect(result).toStrictEqual(RouteResult.UntrustedServer)
    })

    test('null', () => {
      const hostname = 'hostname'
      setRawHostname({
        hostname
      , route_result: null
      , poison_test_result: PoisonTestResult.NotPoisoned
      })

      const result = getRouteResult(hostname)

      expect(result).toStrictEqual(null)
    })
  })
})
