import { IPv4AddressRange, IPv6AddressRange } from 'address-range'
import { isIPv4Address } from '@utils/is-ipv4-address'
import { isIPv6Address } from '@utils/is-ipv6-address'
import { promises as fs } from 'fs'

export class IPRanges {
  constructor(
    private ipv4: IPv4AddressRange[]
  , private ipv6: IPv6AddressRange[]
  ) {}

  static async fromFile(filename: string): Promise<IPRanges> {
    const ipv4: IPv4AddressRange[] = []
    const ipv6: IPv6AddressRange[] = []

    const text = await fs.readFile(filename, 'utf-8')
    text.split('\n')
      .filter(x => x.trim())
      .filter(x => x !== '')
      .forEach(x => {
        if (isIPv4Address(x)) {
          ipv4.push(IPv4AddressRange.from(x, x))
        }

        if (isIPv6Address(x)) {
          ipv6.push(IPv6AddressRange.from(x, x))
        }

        if (isIPv4AddressRange(x)) {
          const [startAddress, endAddress] = x.split('-')
          ipv4.push(IPv4AddressRange.from(startAddress, endAddress))
        }

        if (isIPv6AddressRange(x)) {
          const [startAddress, endAddress] = x.split('-')
          ipv6.push(IPv6AddressRange.from(startAddress, endAddress))
        }
      })

    return new IPRanges(ipv4, ipv6)
  }

  includes(address: string): boolean {
    if (isIPv4Address(address)) {
      return this.ipv4.some(x => x.includes(address))
    }

    if (isIPv6Address(address)) {
      return this.ipv6.some(x => x.includes(address))
    }

    return false
  }
}

function isIPv4AddressRange(text: string): boolean {
  return /^[\d\.]+-[\d\.]+$/.test(text)
}

function isIPv6AddressRange(text: string): boolean {
  return /^[\da-f:]+-[\da-f:]+$/.test(text)
}
