declare module 'native-node-dns' {
  import { EventEmitter } from 'events'
  import { NAME_TO_RCODE } from 'native-node-dns-packet'

  export const consts = {
    NAME_TO_RCODE
  }

  export interface IPacket {
    header: IHeader
    question: IQuestion[]
    answer: IResourceRecord[]
    authority: IResourceRecord[]
    additional: IResourceRecord[]

    send(): void
  }

  export interface IHeader {
    aa: number
    id: number
    opcode: number
    qr: number
    ra: number
    rcode: number
    rd: number
    res1: number
    res2: number
    res3: number
    tc: number
  }

  export interface IQuestion {
    name: string
    type: number
    class: number
  }

  export interface IResourceRecord {
    name: string
    type: number
    class: number
    ttl: number
  }

  interface IRequest extends EventEmitter {
    send(): void
    cancel(): void

    on(event: 'message', cb: (err: Error, answer: IPacket) => void)
    on(event: 'timeout' | 'cancelled' | 'end', cb: () => void)
  }

  interface IServer extends EventEmitter {
    serve(port: number): void
    close(): void

    on(event: 'listening', cb: () => void): void
    on(event: 'request', cb: (req: IPacket, res: IPacket) => void): void
    on(event: 'socketError', cb: (err: Error, socket: unknown) => void): void
    on(
      event: 'error'
    , cb: (err: Error, buff: Buffer, req: IPacket, res: IPacket) => void
    ): void
  }

  export function Request(options: {
    question: IQuestion
    server: {
      address: string
      port?: number
      type?: 'udp' | 'tcp'
    } | string
    timeout?: number
    try_edns?: boolean
    cache?: false
  }): IRequest

  export function createServer(): IServer
}
