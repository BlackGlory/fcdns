import { createCustomLogger } from './logger'
import { Router, Target } from './router'
import * as dns from 'native-dns'
import { IServerInfo } from '@utils/parse-server-info'
import { map } from 'extra-promise'
import { getElapsed } from '@utils/get-elapsed'
import { getTimestamp } from '@utils/get-timestamp'
import { countup } from '@utils/countup'
import { ResourceRecordType } from './resource-record-type'
import { getErrorResultAsync } from 'return-style'
import ms from 'ms'

export function startServer({ logger, port, router, trustedServer, untrustedServer }: {
  router: Router
, untrustedServer: IServerInfo
, trustedServer: IServerInfo
, logger: ReturnType<typeof createCustomLogger>
, port: number
}) {
  const server = dns.createServer()

  server.on('error', console.error)
  server.on('socketError', console.error)
  server.on('request', async (req, res) => {
    const answers = await map(req.question, async question => {
      const id = countup().toString()
      const startTime = getTimestamp()

      var [err, target] = await getErrorResultAsync(() => router.getTarget(question.name))
      if (err) {
        logger.error({
          hostname: question.name
        , id
        , reason: `${err}`
        , timestamp: getTimestamp()
        , elapsed: getElapsed(startTime)
        })
        return []
      }

      logger.debug({
        hostname: question.name
      , id
      , message: Target[target!]
      , timestamp: getTimestamp()
      , elapsed: getElapsed(startTime)
      })

      const server =
        target === Target.Trusted
        ? trustedServer
        : untrustedServer
      var [err, answers] = await getErrorResultAsync(() => resolve(server, question))

      if (err) {
        logger.error({
          hostname: question.name
        , id
        , reason: `${err}`
        , timestamp: getTimestamp()
        , elapsed: getElapsed(startTime)
        })
        return []
      }

      logger.info({
        hostname: question.name
      , id
      , message: ResourceRecordType[question.type]
      , timestamp: getTimestamp()
      , elapsed: getElapsed(startTime)
      })
      return answers!
    })

    answers
      .flat()
      .forEach(answer => res.answer.push(answer))

    res.send()
  })

  return server.serve(port)
}

function resolve(
  server: IServerInfo
, question: dns.IQuestion
): Promise<dns.IResourceRecord[]> {
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
