export function isIPv4Address(text: string): boolean {
  return /^[\d\.]+$/.test(text)
}
