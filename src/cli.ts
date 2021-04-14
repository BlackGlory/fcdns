#!/usr/bin/env node
import { program } from 'commander'
import { buildServer } from './server'
import { Router } from './router'
import { Whitelist } from './whitelist'
import { Tester } from './tester'
import { createDNSResolver } from '@utils/create-dns-resolver'
import { parseLogLevel } from '@utils/parse-log-level'
import { assert } from '@blackglory/errors'
import { createRouteLogger } from './logger'
import { Level } from 'extra-logger'

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

    const tester = await new Tester({
      server: testServer
    , timeout: testTimeout
    , cacheFilename: testCacheFilename
    })
    const untrustedResolver = createDNSResolver(untrustedServer)
    const trustedResolver = createDNSResolver(trustedServer)
    const whitelist = await new Whitelist(whitelistFilename)
    const logger = createRouteLogger(logLevel)
    const resolver = await new Router({
      tester
    , untrustedResolver
    , trustedResolver
    , whitelist
    , cacheFilename: routeCacheFilename
    , logger
    })
    const server = buildServer(resolver.resolveA.bind(resolver))

    server.listen(port)
  })
  .parse()
