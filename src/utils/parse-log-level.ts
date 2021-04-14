import { Level } from 'extra-logger'

export function parseLogLevel(level: string): Level {
  switch (level.toLowerCase()) {
    case 'trace': return Level.Trace
    case 'debug': return Level.Debug
    case 'info': return Level.Info
    case 'warn': return Level.Warn
    case 'error': return Level.Error
    case 'fatal': return Level.Fatal
    default: return Level.None
  }
}
