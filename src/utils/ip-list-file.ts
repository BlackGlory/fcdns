import { promises as fs } from 'fs'
import { IPv4AddressRange, IPv6AddressRange } from 'address-range'
import { isIPv4Address } from '@utils/is-ipv4-address'
import { isIPv6Address } from '@utils/is-ipv6-address'

export async function readIPListFile(
  filename: string
): Promise<{ ipv4: IPv4AddressRange[]; ipv6: IPv6AddressRange[] }> {
  const ipv4AddressRanges: IPv4AddressRange[] = []
  const ipv6AddressRanges: IPv6AddressRange[] = []

  const text = await fs.readFile(filename, 'utf-8')
  text.split('\n')
    .filter(x => x.trim())
    .filter(x => x !== '')
    .forEach(x => {
      if (isIPv4Address(x)) {
        ipv4AddressRanges.push(IPv4AddressRange.from(x, x))
      }

      if (isIPv6Address(x)) {
        ipv6AddressRanges.push(IPv6AddressRange.from(x, x))
      }

      if (isIPv4AddressRange(x)) {
        const [startAddress, endAddress] = x.split('-')
        ipv4AddressRanges.push(IPv4AddressRange.from(startAddress, endAddress))
      }

      if (isIPv6AddressRange(x)) {
        const [startAddress, endAddress] = x.split('-')
        ipv6AddressRanges.push(IPv6AddressRange.from(startAddress, endAddress))
      }
    })

  return { ipv4: ipv4AddressRanges, ipv6: ipv6AddressRanges }
}

function isIPv4AddressRange(text: string): boolean {
  return /^[\d\.]+-[\d\.]+$/.test(text)
}

function isIPv6AddressRange(text: string): boolean {
  return /^[\da-f:]+-[\da-f:]+$/.test(text)
}
