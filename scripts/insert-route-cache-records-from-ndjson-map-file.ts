import { go } from '@blackglory/prelude'
import { text } from 'extra-prompts'
import { readNDJSONMapFile } from './utils/read-ndjson-map-file'
import { RouteResult } from '@src/router'
import { Cache } from '@src/cache'

go(async () => {
  const mapFilename = await text('NDJSON map filename')
  const cacheFilename = await text('cache filename')

  const cache = await Cache.create<RouteResult>(cacheFilename)
  const map = await readNDJSONMapFile<string, RouteResult>(mapFilename)

  for (const [key, value] of map) {
    cache.set(key, value)
  }

  console.log('Done.')
})
