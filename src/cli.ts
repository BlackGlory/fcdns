#!/usr/bin/env node
import { program } from 'commander'
import { startServer } from './server'
import { Router } from './router'
import { IPWhitelist } from './ip-whitelist'
import { HostnameWhitelist } from './hostname-whitelist'
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
  .option('--ip-whitelist <filename>', '', 'ip-whitelist.txt')
  .option('--hostname-whitelist <filename>', '', 'hostname-whitelist.txt')
  .option('--route-cache <filename>', '', 'route.txt')
  .option('--test-cache <filename>', '', 'test.txt')
  .option('--test-timeout <ms>', '', '200')
  .option('--log <level>', '', 'info')
  .option('--loose-mode')
  .action(async () => {
    const options = getOptions()
    const tester = await new Tester({
      server: options.testServer
    , timeout: options.testTimeout
    , cacheFilename: options.testCacheFilename
    })
    const untrustedResolver = createDNSResolver(options.untrustedServer)
    const ipWhitelist = await new IPWhitelist(options.ipWhitelistFilename)
    const hostnameWhitelist = await new HostnameWhitelist(options.hostnameWhitelistFilename)
    const router = await new Router({
      tester
    , untrustedResolver
    , ipWhitelist
    , hostnameWhitelist
    , cacheFilename: options.routeCacheFilename
    , looseMode: options.looseMode
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

  const ipWhitelistFilename: string = opts.ipWhitelist
  const hostnameWhitelistFilename: string = opts.hostnameWhitelist
  const routeCacheFilename: string = opts.routeCache
  const testCacheFilename: string = opts.testCache

  assert(/^\d+$/.test(opts.testTimeout), 'The parameter test timeout must be integer')
  const testTimeout = Number.parseInt(opts.testTimeout, 10)

  const logLevel: Level = parseLogLevel(opts.log)
  const looseMode: boolean = opts.looseMode

  return {
    testServer
  , untrustedServer
  , trustedServer
  , port
  , ipWhitelistFilename
  , hostnameWhitelistFilename
  , routeCacheFilename
  , testCacheFilename
  , testTimeout
  , logLevel
  , looseMode
  }
}
