import { go, isBoolean } from '@blackglory/prelude'
import { text } from 'extra-prompts'
import { readNDJSONMapFile } from './utils/read-ndjson-map-file'
import { PoisonTestResult } from '@src/poison-tester'
import * as Database from '@src/database'
import { youDied } from 'you-died'
import { upsertPoisonTestResult } from '@dao/upsert-poison-test-result'

go(async () => {
  const cacheFilename = await text('cache filename')
  Database.openDatabase(cacheFilename)
  youDied(Database.closeDatabase)
  await Database.prepareDatabase()

  const mapFilename = await text('NDJSON map filename')
  const map = await readNDJSONMapFile<string, PoisonTestResult | boolean>(mapFilename)

  for (const [hostname, result] of map) {
    upsertPoisonTestResult(hostname, normalizePoisonTestResult(result))
  }

  Database.closeDatabase()

  console.log('Done.')
})

function normalizePoisonTestResult(
  value: PoisonTestResult | boolean
): PoisonTestResult {
  if (isBoolean(value)) {
    return value
      ? PoisonTestResult.Poisoned
      : PoisonTestResult.NotPoisoned
  } else {
    return value
  }
}
