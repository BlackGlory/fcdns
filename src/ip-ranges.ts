import { IPv4AddressRange, IPv6AddressRange } from 'address-range'
import { isIPv4Address } from '@utils/is-ipv4-address'
import { isIPv6Address } from '@utils/is-ipv6-address'
import { promises as fs } from 'fs'
import { groupBy } from 'iterable-operator'

export class IPRanges {
  private ipv4: IPv4AddressRange[]
  private ipv6: IPv6AddressRange[]

  constructor(
    ranges: Array<IPv4AddressRange | IPv6AddressRange>
  )
  constructor(
    ipv4: IPv4AddressRange[]
  , ipv6: IPv6AddressRange[]
  )
  constructor(...args:
  | [ranges: Array<IPv4AddressRange | IPv6AddressRange>]
  | [ipv4: IPv4AddressRange[], ipv6: IPv6AddressRange[]]
  ) {
    if (args.length === 1) {
      const [ranges] = args

      const groups = groupBy(ranges, element => {
        if (element instanceof IPv4AddressRange) {
          return 'ipv4'
        } else {
          return 'ipv6'
        }
      })

      this.ipv4 = groups.get('ipv4') as IPv4AddressRange[]
      this.ipv6 = groups.get('ipv6') as IPv6AddressRange[]
    } else {
      const [ipv4, ipv6] = args

      this.ipv4 = ipv4
      this.ipv6 = ipv6
    }
  }

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

  async toFile(filename: string): Promise<void> {
    const ipv4 = this.ipv4
      .map(range => range.toString())
      .join('\n')
    const ipv6 = this.ipv6
      .map(range => range.toString())
      .join('\n')

    await fs.writeFile(filename, [ipv4, ipv6].join('\n'))
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
