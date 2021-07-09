export function isIPv6Address(text: string): boolean {
  return /^[\da-f:]+$/.test(text)
}
