import { Router, RouteResult } from './router.js'
import * as dns from 'native-node-dns'
import { IServerInfo } from '@utils/parse-server-info.js'
import { getErrorResultAsync } from 'return-style'
import { Logger } from 'extra-logger'
import chalk from 'chalk'
import { RecordType } from './record-types.js'
import { go } from '@blackglory/prelude'

interface IStartServerOptions {
  router: Router
  untrustedServer: IServerInfo
  trustedServer: IServerInfo
  logger: Logger
  port: number
  timeout: number
}

export function startServer({
  logger
, port
, timeout
, router
, trustedServer
, untrustedServer
}: IStartServerOptions): void {
  const server = dns.createServer()

  server.on('error', console.error)
  server.on('socketError', console.error)
  server.on('request', async (req, res) => {
    logger.trace(`request: ${JSON.stringify(req)}`)

    res.header.rcode = dns.consts.NAME_TO_RCODE.SERVFAIL

    // https://stackoverflow.com/questions/55092830/how-to-perform-dns-lookup-with-multiple-questions
    const question = req.question[0]

    const startTime = Date.now()
    const [err, result] = await getErrorResultAsync(() => router.route(question.name))
    if (err) {
      logger.error(`${formatHostname(question.name)} ${err}`, getElapsed(startTime))
    } else {
      logger.debug(
        `${formatHostname(question.name)} ${RouteResult[result]}`
      , getElapsed(startTime)
      )

      const server: IServerInfo = go(() => {
        switch (result) {
          case RouteResult.TrustedServer: return trustedServer
          case RouteResult.UntrustedServer: return untrustedServer
          case RouteResult.Unresolved: return untrustedServer
          default: throw new Error('Unknown route result')
        }
      })
      const [err, response] = await getErrorResultAsync(() => resolve(
        server
      , question
      , timeout
      ))
      if (err) {
        logger.error(`${formatHostname(question.name)} ${err}`, getElapsed(startTime))
      } else {
        logger.info(
          `${formatHostname(question.name)} ${formatRecordType(question.type)}`
        , getElapsed(startTime)
        )

        res.header.rcode = response.header.rcode
        res.answer = response.answer
        res.authority = response.authority
      }
    }

    logger.trace(`response: ${JSON.stringify(res)}`)
    res.send()
  })

  server.serve(port)
}

function resolve(
  server: IServerInfo
, question: dns.IQuestion
, timeout: number
): Promise<dns.IPacket> {
  return new Promise((resolve, reject) => {
    let response: dns.IPacket
    const request = dns.Request({
      question
    , server: {
        address: server.host
      , port: server.port
      , type: 'udp'
      }
    , timeout
    , cache: false
    , try_edns: true
    })

    request.on('timeout', () => reject(new Error('timeout')))
    request.on('cancelled', () => reject(new Error('cancelled')))
    request.on('end', () => {
      if (response) {
        resolve(response)
      } else {
        reject(new Error('No response'))
      }
    })
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

function formatRecordType(recordType: number): string {
  return RecordType[recordType] ?? `Unknown(${recordType})`
}
