import { Router, RouteResult } from './router.js'
import { IServerInfo } from '@utils/parse-server-info.js'
import { Logger } from 'extra-logger'
import chalk from 'chalk'
import { go } from '@blackglory/prelude'
import { DNSClient, DNSServer, IPacket, IQuestion, QR, RCODE, TYPE } from 'extra-dns'
import { timeoutSignal } from 'extra-abort'

interface IStartServerOptions {
  router: Router
  untrustedServer: IServerInfo
  trustedServer: IServerInfo
  logger: Logger
  port: number
  timeout: number
}

export async function startServer(
  {
    logger
  , port
  , timeout
  , router
  , trustedServer
  , untrustedServer
  }: IStartServerOptions
): Promise<() => Promise<void>> {
  const trustedClient = new DNSClient(trustedServer.host, trustedServer.port ?? 53)
  const untrustedClient = new DNSClient(untrustedServer.host, untrustedServer.port ?? 53)
  const server = new DNSServer('0.0.0.0', port)

  server.on('query', async (query, respond) => {
    logger.trace(`request: ${JSON.stringify(query)}`)

    // 默认失败响应.
    let response: IPacket = {
      header: {
        ID: query.header.ID
      , flags: {
          QR: QR.Response
        , OPCODE: query.header.flags.OPCODE
        , AA: 0
        , TC: 0
        , RD: 0
        , RA: 0
        , Z: 0
        , RCODE: RCODE.ServFail
        }
      }
    , questions: query.questions
    , answers: []
    , authorityRecords: []
    , additionalRecords: []
    }

    // https://stackoverflow.com/questions/55092830/how-to-perform-dns-lookup-with-multiple-questions
    const question = query.questions[0] as IQuestion | undefined
    if (question) {
      const startTime = Date.now()

      try {
        const result = await router.route(question.QNAME)

        logger.debug(
          `${formatHostname(question.QNAME)} ${RouteResult[result]}`
        , getElapsed(startTime)
        )

        const client: DNSClient = go(() => {
          switch (result) {
            case RouteResult.TrustedServer: return trustedClient
            case RouteResult.UntrustedServer: return untrustedClient
            case RouteResult.Unresolved: return untrustedClient
            default: throw new Error('Unknown route result')
          }
        })

        try {
          response = await client.resolve(query, timeoutSignal(timeout))

          logger.info(
            `${formatHostname(question.QNAME)} ${formatRecordType(question.QTYPE)}`
          , getElapsed(startTime)
          )
        } catch (err) {
          logger.error(`${formatHostname(question.QNAME)} ${err}`, getElapsed(startTime))
        }
      } catch (err) {
        logger.error(`${formatHostname(question.QNAME)} ${err}`, getElapsed(startTime))
      }
    }

    logger.trace(`response: ${JSON.stringify(response)}`)
    await respond(response)
  })

  return await server.listen()
}

function formatHostname(hostname: string): string {
  return chalk.cyan(hostname)
}

function formatRecordType(recordType: number): string {
  return TYPE[recordType] ?? `Unknown(${recordType})`
}

function getElapsed(startTime: number): number {
  return Date.now() - startTime
}
