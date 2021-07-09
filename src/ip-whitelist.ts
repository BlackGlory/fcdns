import { IPv4AddressRange, IPv6AddressRange } from 'address-range'
import { AsyncConstructor } from 'async-constructor'
import { readIPListFile } from '@utils/ip-list-file'
import { isIPv4Address } from '@utils/is-ipv4-address'
import { isIPv6Address } from '@utils/is-ipv6-address'

export class IPWhitelist extends AsyncConstructor {
  ipv4!: IPv4AddressRange[]
  ipv6!: IPv6AddressRange[]

  constructor(filename: string) {
    super(async () => {
      const { ipv4, ipv6 } = await readIPListFile(filename)
      this.ipv4 = ipv4
      this.ipv6 = ipv6
    })
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
