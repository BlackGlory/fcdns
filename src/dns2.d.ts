interface IPacket {
  TYPE: {
    A: number
    NS: number
    MD: numbre
    MF: number
    CNAME: number
    SOA: number
    MB: number
    MG: number
    MR: number
    NULL: number
    WKS: number
    PTR: number
    HINFO: number
    MINFO: number
    MX: number
    TXT: number
    AAAA: number
    SRV: number
    EDNS: number
    SPF: number
    AXFR: number
    MAILB: number
    MAILA: number
    ANY: number
    CAA: number
  }

  CLASS: {
    IN: number
    CS: number
    CH: number
    HS: number
    ANY: number
  }

  createResponseFromRequest(request: DNS.DnsRequest): IResponse
}

interface IRequest {
  header: { id: string }
  questions: IQuestion[]
}

interface IQuestion {
  name: string
}

interface IResponse {
  answers: IAnswer[]
}

interface IAnswer {
  name: string
  type: number
  class: number
  ttl: number
  address: string
}

declare module 'dns2' {
  export function createUDPServer(
    callback: (
      request: IRequest
    , sendResponse: (response: IResponse) => void
    , remoteInfo: import('dgram').RemoteInfo
    ) => void
  ): import('net').Server

  export const Packet: IPacket
}
