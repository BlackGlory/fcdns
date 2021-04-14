import { Level } from 'extra-logger'

export function levelToString(level: Level): string {
  switch (level) {
    case Level.Info: return 'Info'
    case Level.Debug: return 'Debug'
    case Level.Warn: return 'Warn'
    case Level.Trace: return 'Trace'
    case Level.Error: return 'Error'
    case Level.Fatal: return 'Fatal'
    default: return 'None'
  }
}
