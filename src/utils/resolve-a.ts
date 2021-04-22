import { promises as dns } from 'dns'
import { timeout } from 'extra-promise'

export { TimeoutError } from 'extra-promise'

/**
 * @throws {NodeJS.ErrnoException}
 * @throws {TimeoutError}
 */
export async function resolveA(
  resolver: dns.Resolver
, hostname: string
, timeoutMsecs?: number
): Promise<string[]> {
  if (timeoutMsecs) {
    return await Promise.race([
      resolver.resolve4(hostname)
    , timeout(timeoutMsecs)
    ])
  } else {
    return await resolver.resolve4(hostname)
  }
}
