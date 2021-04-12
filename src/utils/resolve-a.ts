import { RecordWithTtl } from 'dns'
import { promises as dns } from 'dns'
import { timeout } from 'extra-promise'

export async function resolveA(
  resolver: dns.Resolver
, hostname: string
, timeoutMsecs?: number
): Promise<RecordWithTtl[]> {
  if (timeoutMsecs) {
    return await Promise.race([
      resolver.resolve4(hostname, { ttl: true })
    , timeout(timeoutMsecs)
    ])
  } else {
    return await resolver.resolve4(hostname, { ttl: true })
  }
}
