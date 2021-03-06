import {
  downloadLatestStatisticsFile
, parseStatisticsFile
, isRecord, IRecord, Domain, Registry
} from 'internet-number'
import { createTempFile } from 'extra-filesystem'
import { promises as fs } from 'fs'
import { AsyncIterableOperator } from 'iterable-operator/lib/es2018/style/chaining/async-iterable-operator'
import { IPv4AddressRange, IPv6AddressRange, compress } from 'address-range'
import { go } from '@blackglory/go'
import { writeIPListFile } from '../src/utils/ip-list-file'

go(async () => {
  const ranges = await go(async () => {
    const filename = await createTempFile()
    try {
      await downloadLatestStatisticsFile(Domain.APNIC, Registry.APNIC, filename)
      return await parseAddressRangesFromStatisticsFile(filename, ['CN'])
    } finally {
      await fs.rm(filename)
    }
  })

  await writeIPListFile('whitelist.txt', ranges)
})

export async function parseAddressRangesFromStatisticsFile(
  filename: string
, cc: string[]
): Promise<Array<IPv4AddressRange | IPv6AddressRange>> {
  const records = await new AsyncIterableOperator(parseStatisticsFile(filename))
    .filterAsync<IRecord>(isRecord)
    .filterAsync(record => cc.includes(record.cc))
    .toArrayAsync()

  return convertRecordsToRanges(records)
}

export function convertRecordsToRanges(
  records: IRecord[]
): Array<IPv4AddressRange | IPv6AddressRange> {
  const ipv4Ranges = records
    .filter(x => x.type === 'ipv4')
    .map(x => {
      const startAddress = x.start
      const hosts = Number.parseInt(x.value, 10)
      return IPv4AddressRange.from(startAddress, hosts)
    })

  const ipv6Ranges = records
    .filter(x => x.type === 'ipv6')
    .map(x => {
      const startAddress = x.start
      const cidr = Number.parseInt(x.value, 10)
      return IPv6AddressRange.from(startAddress, cidr)
    })

  const cleanIPv4Ranges = compress(ipv4Ranges, IPv4AddressRange)
  const cleanIPv6Ranges = compress(ipv6Ranges, IPv6AddressRange)

  return [...cleanIPv4Ranges, ...cleanIPv6Ranges]
}
