import { getTimestamp } from '@utils/get-timestamp'

export function getElapsed(startTime: number): number {
  return getTimestamp() - startTime
}
