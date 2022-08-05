import { getDatabase } from '@src/database'

export function clear(): void {
  getDatabase().prepare(`
    DELETE FROM hostname
  `).run()
}
