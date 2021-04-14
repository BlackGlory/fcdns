import { IPv4AddressRange, IPv6AddressRange } from 'address-range'
import { AsyncConstructor } from 'async-constructor'
import { readAddressRangesFile } from '@utils/address-ranges-file'

export class Whitelist extends AsyncConstructor {
  ipv4!: IPv4AddressRange[]
  ipv6!: IPv6AddressRange[]

  constructor(filename: string) {
    super(async () => {
      const { ipv4, ipv6 } = await readAddressRangesFile(filename)
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

function isIPv4Address(address: string): boolean {
  return /^[\d\.]+$/.test(address)
}

function isIPv6Address(address: string): boolean {
  return /^[\da-f:]+$/.test(address)
}
