import { promises as dns } from 'dns'

export function createDNSResolver(...servers: string[]): dns.Resolver {
  const resolver = new dns.Resolver()
  resolver.setServers(servers)
  return resolver
}
