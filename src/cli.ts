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
import { IServerInfo, parseServerInfo } from '@utils/parse-server-info'
import { youDied } from 'you-died'
import * as Database from './database'

interface IOptions {
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
}

const { name, version, description } = require('../package.json')
process.title = name

program
  .name(name)
  .version(version)
  .description(description)
  .requiredOption('--test-server <server>')
  .requiredOption('--untrusted-server <server>')
  .requiredOption('--trusted-server <server>')
  .option('--port <port>', '', '53')
  .option('--timeout <seconds>', '', '30')
  .option('--ip-whitelist <filename>', '', 'ip-whitelist.txt')
  .option('--hostname-whitelist <filename>', '', 'hostname-whitelist.txt')
  .option('--hostname-blacklist <filename>', '', 'hostname-blacklist.txt')
  .option('--cache <filename>', '', 'cache.db')
  .option('--test-timeout <milliseconds>', '', '200')
  .option('--log <level>', '', 'info')
  .action(async () => {
    const options = program.opts<IOptions>()
    const cacheFilename = getCacheFilename(options)
    const testServer = getTestServer(options)
    const testTimeout = getTestTimeout(options)
    const timeout = getTimeout(options)
    const port = getPort(options)
    const logLevel = getLogLevel(options)
    const ipWhitelistFilename = getIpWhiltelistFilename(options)
    const hostnameWhitelistFilename = getHostnameWhitelistFilename(options)
    const hostnameBlacklistFilename = getHostnameBlacklistFilename(options)
    const untrustedServer = getUntrustedServer(options)
    const trustedServer = getTrustedServer(options)

    Database.openDatabase(cacheFilename)
    await Database.prepareDatabase()
    youDied(() => Database.closeDatabase())

    const poisonTester = new PoisonTester({
      server: testServer
    , timeout: testTimeout
    })

    const untrustedResolver = createDNSResolver(
      untrustedServer.host
    + (untrustedServer.port ? `:${untrustedServer.port}` : '')
    )
    const ipWhitelist = await IPRanges.fromFile(ipWhitelistFilename)
    const hostnameWhitelist = await Hostnames.fromFile(hostnameWhitelistFilename)
    const hostnameBlacklist = await Hostnames.fromFile(hostnameBlacklistFilename)
    const router = new Router({
      poisonTester
    , untrustedResolver
    , ipWhitelist
    , hostnameWhitelist
    , hostnameBlacklist
    })
    const logger = new Logger({
      level: logLevel
    , transport: new TerminalTransport({})
    })

    startServer({
      router
    , logger
    , trustedServer
    , untrustedServer
    , timeout
    , port
    })
  })
  .parse()

function getTestServer(options: IOptions): string {
  return options.testServer
}

function getUntrustedServer(options: IOptions): IServerInfo {
  return parseServerInfo(options.untrustedServer)
}

function getTrustedServer(options: IOptions): IServerInfo {
  return parseServerInfo(options.trustedServer)
}

function getPort(options: IOptions): number {
  assert(/^\d+$/.test(options.port), 'The parameter port must be integer')

  return Number.parseInt(options.port, 10)
}

function getTimeout(options: IOptions): number {
  assert(/^\d+$/.test(options.timeout), 'The parameter timeout must be integer')

  return Number.parseInt(options.port, 10) * 1000
}

function getIpWhiltelistFilename(options: IOptions): string {
  return options.ipWhitelist
}

function getHostnameWhitelistFilename(options: IOptions): string {
  return options.hostnameWhitelist
}

function getHostnameBlacklistFilename(options: IOptions): string {
  return options.hostnameBlacklist
}

function getCacheFilename(options: IOptions): string {
  return options.cache
}

function getTestTimeout(options: IOptions): number {
  assert(/^\d+$/.test(options.testTimeout), 'The parameter test timeout must be integer')

  return Number.parseInt(options.testTimeout, 10)
}

function getLogLevel(options: IOptions): Level {
  return stringToLevel(options.log, Level.Info)
}
