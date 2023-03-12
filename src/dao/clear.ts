import { getDatabase } from '@src/database.js'
import { withLazyStatic, lazyStatic } from 'extra-lazy'

export const clear = withLazyStatic(function (): void {
  lazyStatic(() => getDatabase().prepare(`
    DELETE FROM hostname
  `), [getDatabase()]).run()
})
