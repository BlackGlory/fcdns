import { HostnamePattern } from '@utils/hostname-pattern'

describe('HostnamePattern', () => {
  test('wildcard match', () => {
    const pattern = new HostnamePattern('*.example.com')

    expect(pattern.match('example.com')).toBeFalsy()
    expect(pattern.match('static.example.com')).toBeTruthy()
  })

  test('exact match', () => {
    const pattern = new HostnamePattern('example.com')

    expect(pattern.match('example.com')).toBeTruthy()
    expect(pattern.match('static.example.com')).toBeFalsy()
  })
})
