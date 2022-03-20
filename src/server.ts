import { Router, Target } from './router'
import * as dns from 'native-node-dns'
import { IServerInfo } from '@utils/parse-server-info'
import { getErrorResultAsync } from 'return-style'
import { Logger } from 'extra-logger'
import ms from 'ms'
import chalk from 'chalk'
import { RecordType } from './record-types'

interface IStartServerOptions {
  router: Router
  untrustedServer: IServerInfo
  trustedServer: IServerInfo
  logger: Logger
  port: number
}

export function startServer({
  logger
, port
, router
, trustedServer
, untrustedServer
}: IStartServerOptions) {
  const server = dns.createServer()

  server.on('error', console.error)
  server.on('socketError', console.error)
  server.on('request', async (req, res) => {
    logger.trace(`request: ${JSON.stringify(req)}`)

    res.header.rcode = dns.consts.NAME_TO_RCODE.SERVFAIL

    const startTime = Date.now()
    const question = req.question[0]
    var [err, target] = await getErrorResultAsync(() => router.getTarget(question.name))
    if (err) {
      logger.error(`${formatHostname(question.name)} ${err}`, getElapsed(startTime))
      logger.trace(`response: ${JSON.stringify(res)}`)
      return res.send()
    }
    logger.debug(`${formatHostname(question.name)} ${Target[target!]}`, getElapsed(startTime))

    const server = target === Target.Trusted ? trustedServer : untrustedServer
    var [err, response] = await getErrorResultAsync(() => resolve(server, question))
    if (err) {
      logger.error(`${formatHostname(question.name)} ${err}`, getElapsed(startTime))
      logger.trace(`response: ${JSON.stringify(res)}`)
      return res.send()
    }
    logger.info(`${formatHostname(question.name)} ${RecordType[question.type]}`, getElapsed(startTime))

    res.header.rcode = response!.header.rcode
    res.answer = response!.answer
    res.authority = response!.authority

    logger.trace(`response: ${JSON.stringify(res)}`)
    res.send()
  })

  return server.serve(port)
}

function resolve(server: IServerInfo, question: dns.IQuestion): Promise<dns.IPacket> {
  return new Promise((resolve, reject) => {
    let response: dns.IPacket
    const request = dns.Request({
      question
    , server: {
        address: server.host
      , port: server.port
      , type: 'udp'
      }
    , timeout: ms('30s')
    , cache: false
    , try_edns: true
    })

    request.on('timeout', () => reject())
    request.on('cancelled', () => reject())
    request.on('end', () => resolve(response))
    request.on('message', (err, msg) => {
      if (err) return reject(err)
      response = msg
    })

    request.send()
  })
}

function formatHostname(hostname: string): string {
  return chalk.cyan(hostname)
}

function getElapsed(startTime: number): number {
  return Date.now() - startTime
}
