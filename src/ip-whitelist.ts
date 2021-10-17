import { IPv4AddressRange, IPv6AddressRange } from 'address-range'
import { readIPListFile } from '@utils/ip-list-file'
import { isIPv4Address } from '@utils/is-ipv4-address'
import { isIPv6Address } from '@utils/is-ipv6-address'

export class IPWhitelist {
  private constructor(
    private ipv4: IPv4AddressRange[]
  , private ipv6: IPv6AddressRange[]
  ) {}

  static async create(filename: string): Promise<IPWhitelist> {
    const { ipv4, ipv6 } = await readIPListFile(filename)

    return new IPWhitelist(ipv4, ipv6)
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
