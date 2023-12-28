declare module 'native-node-dns' {
  import { EventEmitter } from 'events'
  import { NAME_TO_RCODE, NAME_TO_QTYPE, Packet, IHeader, IPacket, IQuestion, IResourceRecord } from 'native-node-dns-packet'

  export const consts = {
    NAME_TO_RCODE
  , NAME_TO_QTYPE
  }

  export interface IPacket extends Packet {
    header: IHeader
    question: IQuestion[]
    answer: IResourceRecord[]
    authority: IResourceRecord[]
    additional: IResourceRecord[]

    send(): void
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
