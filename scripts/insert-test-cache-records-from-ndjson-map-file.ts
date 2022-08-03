import { go, isBoolean } from '@blackglory/prelude'
import { text } from 'extra-prompts'
import { readNDJSONMapFile } from './utils/read-ndjson-map-file'
import { TestResult } from '@src/poison-tester'
import { Cache } from '@src/cache'

go(async () => {
  const mapFilename = await text('NDJSON map filename')
  const cacheFilename = await text('cache filename')

  const cache = await Cache.create<TestResult>(cacheFilename)
  const map = await readNDJSONMapFile<string, TestResult | boolean>(mapFilename)

  for (const [key, value] of map) {
    cache.set(key, normalizeTestResult(value))
  }

  console.log('Done.')
})

function normalizeTestResult(value: TestResult | boolean): TestResult {
  if (isBoolean(value)) {
    return value
      ? TestResult.Poisoned
      : TestResult.NotPoisoned
  } else {
    return value
  }
}
