import { Router, Target } from './router'
import * as dns from 'native-node-dns'
import { IServerInfo } from '@utils/parse-server-info'
import { map } from 'extra-promise'
import { ResourceRecordType } from './resource-record-type'
import { getErrorResultAsync } from 'return-style'
import { Logger } from 'extra-logger'
import ms from 'ms'
import chalk from 'chalk'

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
    const answers = await map(req.question, async question => {
      const startTime = Date.now()
      var [err, target] = await getErrorResultAsync(() => router.getTarget(question.name))
      if (err) {
        logger.error(`${formatHostname(question.name)} ${err}`, getElapsed(startTime))
        return []
      }

      logger.debug(`${formatHostname(question.name)} ${Target[target!]}`, getElapsed(startTime))

      const server =
        target === Target.Trusted
        ? trustedServer
        : untrustedServer
      var [err, answers] = await getErrorResultAsync(() => resolve(server, question))

      if (err) {
        logger.error(`${formatHostname(question.name)} ${err}`, getElapsed(startTime))
        return []
      }

      logger.info(`${formatHostname(question.name)} ${ResourceRecordType[question.type]}`, getElapsed(startTime))
      return answers!
    })

    answers
      .flat()
      .forEach(answer => res.answer.push(answer))

    res.send()
  })

  return server.serve(port)
}

function resolve(server: IServerInfo, question: dns.IQuestion): Promise<dns.IResourceRecord[]> {
  return new Promise((resolve, reject) => {
    const answers: dns.IResourceRecord[] = []
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
    request.on('end', () => resolve(answers))
    request.on('message', (err, msg) => {
      if (err) return reject(err)
      msg.answer.forEach(answer => answers.push(answer))
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
