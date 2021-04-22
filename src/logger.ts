import { createLogger, Level } from 'extra-logger'
import { levelToString } from '@utils/level-to-string'
import { isntUndefined } from '@blackglory/types'
import chalk from 'chalk'

export interface IMessageLog {
  id: string
  timestamp: number
  hostname: string
  message: string
  elapsed?: number
}

export interface IErrorLog {
  id: string
  timestamp: number
  hostname: string
  reason: string
  elapsed?: number
}

interface IPrefix {
  level: Level
  id: string
  timestamp: number
  hostname: string
}

export function createCustomLogger(level: Level) {
  return createLogger(level, {
    [Level.Trace]: printMessage(Level.Trace, console.log)
  , [Level.Debug]: printMessage(Level.Debug, console.log)
  , [Level.Info]: printMessage(Level.Info, console.info)
  , [Level.Warn]: printMessage(Level.Warn, console.warn)
  , [Level.Error]: printError(Level.Error, console.error)
  , [Level.Fatal]: printError(Level.Fatal, console.error)
  })
}

function printMessage(
  level: Level
, log: (...args: unknown[]) => void
): (log: IMessageLog) => void {
  return ({ id, timestamp, hostname, elapsed, message }: IMessageLog) => {
    const pre = createPrefix({ level, id, timestamp, hostname })
    const post = isntUndefined(elapsed) ? createPostfix({ elapsed }) : null

    let result = `${pre} ${message}`
    if (post) result += ' ' + post

    log(result)
  }
}

function printError(
  level: Level
, log: (...args: unknown[]) => void
): (error: IErrorLog) => void {
  return ({ id, timestamp, hostname, elapsed, reason }: IErrorLog) => {
    const pre = createPrefix({ level, id, timestamp, hostname })
    const post = isntUndefined(elapsed) ? createPostfix({ elapsed }) : null

    let result = `${pre} ${reason}`
    if (post) result += ' ' + post

    log(result)
  }
}

function createPrefix({ level, timestamp, id, hostname }: IPrefix): string {
  return `[${levelToString(level).toUpperCase()}]`
       + `[${formatDate(timestamp)}]`
       + ` #${id}`
       + ` ${formatHostname(hostname)}`
}

function createPostfix({ elapsed }: { elapsed: number }): string {
  return formatElapsedTime(elapsed)
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString()
}

function formatHostname(hostname: string): string {
  return chalk.cyan(hostname)
}

function formatElapsedTime(elapsed: number): string {
  if (elapsed <= 100) {
    return chalk.green`${elapsed}ms`
  }

  if (elapsed <= 300) {
    return chalk.yellow`${elapsed}ms`
  }

  return chalk.red`${elapsed}ms`
}
