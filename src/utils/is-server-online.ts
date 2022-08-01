import { timeout, TimeoutError } from 'extra-promise'
import { promise as sys } from 'ping'
import { go } from '@blackglory/prelude'

export async function isServerOnline(
  address: string
, timeoutMsecs: number
): Promise<boolean> {
  try {
    const result = await Promise.race([
      go(async () => {
        const res = await sys.probe(address)
        return res.alive
      })
    , timeout(timeoutMsecs)
    ])
    return result
  } catch (e) {
    if (e instanceof TimeoutError) return false

    throw e
  }
}
