#!/usr/bin/env node
import { program } from 'commander'
import { startServer } from './server'
import { Router } from './router'
import { Whitelist } from './whitelist'
import { Tester } from './tester'
import { createDNSResolver } from '@utils/create-dns-resolver'
import { parseLogLevel } from '@utils/parse-log-level'
import { assert } from '@blackglory/errors'
import { createCustomLogger } from './logger'
import { Level } from 'extra-logger'
import { parseServerInfo } from '@utils/parse-server-info'

program
  .name(require('../package.json').name)
  .version(require('../package.json').version)
  .description(require('../package.json').description)
  .option('--test-server <server>', '')
  .option('--untrusted-server <server>', '')
  .option('--trusted-server <server>', '')
  .option('--port <port>', '', '53')
  .option('--whitelist <filename>', '', 'whitelist.txt')
  .option('--route-cache <filename>', '', 'route.txt')
  .option('--test-cache <filename>', '', 'test.txt')
  .option('--test-timeout <ms>', '', '200')
  .option('--log <level>', '', 'info')
  .action(async () => {
    const options = getOptions()
    const tester = await new Tester({
      server: options.testServer
    , timeout: options.testTimeout
    , cacheFilename: options.testCacheFilename
    })
    const untrustedResolver = createDNSResolver(options.untrustedServer)
    const whitelist = await new Whitelist(options.whitelistFilename)
    const router = await new Router({
      tester
    , untrustedResolver
    , whitelist
    , cacheFilename: options.routeCacheFilename
    })
    const logger = createCustomLogger(options.logLevel)

    const untrustedServer = parseServerInfo(options.untrustedServer)
    const trustedServer = parseServerInfo(options.trustedServer)

    startServer({
      router
    , logger
    , trustedServer
    , untrustedServer
    , port: options.port
    })
  })
  .parse()

function getOptions() {
  const opts = program.opts()

  const testServer: string = opts.testServer
  const untrustedServer: string = opts.untrustedServer
  const trustedServer: string = opts.trustedServer

  assert(/^\d+$/.test(opts.port), 'The parameter port must be integer')
  const port: number = Number.parseInt(opts.port, 10)

  const whitelistFilename: string = opts.whitelist
  const routeCacheFilename: string = opts.routeCache
  const testCacheFilename: string = opts.testCache

  assert(/^\d+$/.test(opts.testTimeout), 'The parameter test timeout must be integer')
  const testTimeout = Number.parseInt(opts.testTimeout, 10)

  const logLevel: Level = parseLogLevel(opts.log)

  return {
    testServer
  , untrustedServer
  , trustedServer
  , port
  , whitelistFilename
  , routeCacheFilename
  , testCacheFilename
  , testTimeout
  , logLevel
  }
}
