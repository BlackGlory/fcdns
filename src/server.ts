import { RecordWithTtl } from 'dns'
import dns2 from 'dns2'
import * as net from 'net'

export function buildServer(resolveA: (domain: string) => Promise<RecordWithTtl[]>): net.Server {
  return dns2.createUDPServer(async (request, send) => {
    const response = dns2.Packet.createResponseFromRequest(request)
    const hostname = request.questions[0].name
    const result = await resolveA(hostname)
    for (const record of result) {
      response.answers.push({
        name: hostname
      , type: dns2.Packet.TYPE.A
      , class: dns2.Packet.CLASS.IN
      , ttl: record.ttl
      , address: record.address
      })
    }
    send(response)
  })
}
