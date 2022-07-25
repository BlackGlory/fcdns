#!/usr/bin/env node
import { program } from 'commander'
import { startServer } from './server'
import { Router } from './router'
import { IPWhitelist } from './ip-whitelist'
import { HostnameList } from './hostname-list'
import { Tester } from './tester'
import { createDNSResolver } from '@utils/create-dns-resolver'
import { assert } from '@blackglory/errors'
import { Level, Logger, TerminalTransport, stringToLevel } from 'extra-logger'
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
  .option('--hostname-blacklist <filename>', '', 'hostname-blacklist.txt')
  .option('--route-cache <filename>', '', 'route.txt')
  .option('--test-cache <filename>', '', 'test.txt')
  .option('--test-timeout <ms>', '', '200')
  .option('--log <level>', '', 'info')
  .action(async () => {
    const options = getOptions()
    const tester = await Tester.create({
      server: options.testServer
    , timeout: options.testTimeout
    , cacheFilename: options.testCacheFilename
    })
    const untrustedResolver = createDNSResolver(options.untrustedServer)
    const ipWhitelist = await IPWhitelist.create(options.ipWhitelistFilename)
    const hostnameWhitelist = await HostnameList.create(options.hostnameWhitelistFilename)
    const hostnameBlacklist = await HostnameList.create(options.hostnameBlacklistFilename)
    const router = await Router.create({
      tester
    , untrustedResolver
    , ipWhitelist
    , hostnameWhitelist
    , hostnameBlacklist
    , cacheFilename: options.routeCacheFilename
    })
    const logger = new Logger({
      level: options.logLevel
    , transport: new TerminalTransport({})
    })

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
  const opts = program.opts<{
    testServer: string
    untrustedServer: string
    trustedServer: string
    port: string
    ipWhitelist: string
    hostnameWhitelist: string
    hostnameBlacklist: string
    routeCache: string
    testCache: string
    testTimeout: string
    log: string
  }>()

  const testServer: string = opts.testServer
  const untrustedServer: string = opts.untrustedServer
  const trustedServer: string = opts.trustedServer

  assert(/^\d+$/.test(opts.port), 'The parameter port must be integer')
  const port: number = Number.parseInt(opts.port, 10)

  const ipWhitelistFilename: string = opts.ipWhitelist
  const hostnameWhitelistFilename: string = opts.hostnameWhitelist
  const hostnameBlacklistFilename: string = opts.hostnameBlacklist
  const routeCacheFilename: string = opts.routeCache
  const testCacheFilename: string = opts.testCache

  assert(/^\d+$/.test(opts.testTimeout), 'The parameter test timeout must be integer')
  const testTimeout = Number.parseInt(opts.testTimeout, 10)

  const logLevel: Level = stringToLevel(opts.log, Level.Info)

  return {
    testServer
  , untrustedServer
  , trustedServer
  , port
  , ipWhitelistFilename
  , hostnameWhitelistFilename
  , hostnameBlacklistFilename
  , routeCacheFilename
  , testCacheFilename
  , testTimeout
  , logLevel
  }
}
