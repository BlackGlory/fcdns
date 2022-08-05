import { go } from '@blackglory/prelude'
import { text } from 'extra-prompts'
import { readNDJSONMapFile } from './utils/read-ndjson-map-file'
import { RouteResult } from '@src/router'
import * as Database from '@src/database'
import { youDied } from 'you-died'
import { upsertRouteResult } from '@dao/upsert-route-result'

go(async () => {
  const cacheFilename = await text('Cache filename')
  Database.openDatabase(cacheFilename)
  youDied(Database.closeDatabase)
  await Database.prepareDatabase()

  const mapFilename = await text('NDJSON map filename')
  const map = await readNDJSONMapFile<string, RouteResult>(mapFilename)

  for (const [hostname, result] of map) {
    upsertRouteResult(hostname, result)
  }

  Database.closeDatabase()

  console.log('Done.')
})
