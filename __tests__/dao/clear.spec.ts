import { clear } from '@dao/clear'
import { initializeDatabase, clearDatabase, setRawHostname, hasRawHostname } from './utils'

beforeEach(initializeDatabase)
afterEach(clearDatabase)

describe('clear', () => {
  it('deletes all items', () => {
    const hostname = 'hostname'
    setRawHostname({
      hostname
    , poison_test_result: 0
    , route_result: 0
    })

    clear()

    expect(hasRawHostname(hostname)).toBe(false)
  })
})
