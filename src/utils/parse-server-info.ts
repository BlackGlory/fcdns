export interface IServerInfo {
  host: string
  port?: number
}

export function parseServerInfo(server: string): IServerInfo {
  const [host, port] = server.split(':') as [string, string | undefined]
  return {
    host
  , port: port ? Number.parseInt(port, 10) : undefined
  }
}
