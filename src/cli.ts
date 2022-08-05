#!/usr/bin/env node
import { program } from 'commander'
import { startServer } from './server'
import { Router } from './router'
import { IPRanges } from './ip-ranges'
import { Hostnames } from './hostnames'
import { PoisonTester } from './poison-tester'
import { createDNSResolver } from '@utils/create-dns-resolver'
import { assert } from '@blackglory/prelude'
import { Level, Logger, TerminalTransport, stringToLevel } from 'extra-logger'
import { parseServerInfo } from '@utils/parse-server-info'
import { youDied } from 'you-died'
import * as Database from './database'

const { name, version, description } = require('../package.json')
process.title = name

program
  .name(name)
  .version(version)
  .description(description)
  .requiredOption('--test-server <server>')
  .requiredOption('--untrusted-server <server>')
  .requiredOption('--trusted-server <server>')
  .option('--port [port]', '', '53')
  .option('--timeout [seconds]', '', '30')
  .option('--ip-whitelist [filename]', '', 'ip-whitelist.txt')
  .option('--hostname-whitelist [filename]', '', 'hostname-whitelist.txt')
  .option('--hostname-blacklist [filename]', '', 'hostname-blacklist.txt')
  .option('--cache [filename]', '', 'cache.db')
  .option('--test-timeout [ms]', '', '200')
  .option('--log [level]', '', 'info')
  .action(async () => {
    const options = getOptions()

    Database.openDatabase(options.cacheFilename)
    await Database.prepareDatabase()
    youDied(() => Database.closeDatabase())

    const poisonTester = new PoisonTester({
      server: options.testServer
    , timeout: options.testTimeout
    })

    const untrustedResolver = createDNSResolver(options.untrustedServer)
    const ipWhitelist = await IPRanges.fromFile(options.ipWhitelistFilename)
    const hostnameWhitelist = await Hostnames.fromFile(options.hostnameWhitelistFilename)
    const hostnameBlacklist = await Hostnames.fromFile(options.hostnameBlacklistFilename)
    const router = new Router({
      poisonTester
    , untrustedResolver
    , ipWhitelist
    , hostnameWhitelist
    , hostnameBlacklist
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
    , timeout: options.timeout
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
    timeout: string
    ipWhitelist: string
    hostnameWhitelist: string
    hostnameBlacklist: string
    cache: string
    testTimeout: string
    log: string
  }>()

  const testServer: string = opts.testServer
  const untrustedServer: string = opts.untrustedServer
  const trustedServer: string = opts.trustedServer

  assert(/^\d+$/.test(opts.port), 'The parameter port must be integer')
  const port: number = Number.parseInt(opts.port, 10)

  assert(/^\d+$/.test(opts.timeout), 'The parameter timeout must be integer')
  const timeout: number = Number.parseInt(opts.port, 10) * 1000

  const ipWhitelistFilename: string = opts.ipWhitelist
  const hostnameWhitelistFilename: string = opts.hostnameWhitelist
  const hostnameBlacklistFilename: string = opts.hostnameBlacklist
  const cacheFilename: string = opts.cache

  assert(/^\d+$/.test(opts.testTimeout), 'The parameter test timeout must be integer')
  const testTimeout = Number.parseInt(opts.testTimeout, 10)

  const logLevel: Level = stringToLevel(opts.log, Level.Info)

  return {
    testServer
  , untrustedServer
  , trustedServer
  , port
  , timeout
  , ipWhitelistFilename
  , hostnameWhitelistFilename
  , hostnameBlacklistFilename
  , cacheFilename
  , testTimeout
  , logLevel
  }
}
