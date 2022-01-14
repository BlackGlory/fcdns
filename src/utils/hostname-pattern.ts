export class HostnamePattern {
  private re: RegExp

  constructor(pattern: string) {
    const re = pattern.replace(/\./g, '\\.')
                      .replace(/\*/g, '.*')
    this.re = new RegExp(`^${re}$`, 'i')
  }

  match(hostname: string): boolean {
    return this.re.test(hostname)
  }
}
