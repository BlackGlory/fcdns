import { IterableOperator, AsyncIterableOperator } from 'iterable-operator/lib/es2018/style/chaining'
import { promises as fs } from 'fs'
import { ensureFile, readFileLineByLine } from 'extra-filesystem'

export async function readMapFile<T, U>(
  filename: string
): Promise<Map<T, U>> {
  await ensureFile(filename)

  const map = new Map()
  const iter = new AsyncIterableOperator(readFileLineByLine(filename))
    .filterAsync(x => !!x)
    .mapAsync(x => JSON.parse(x) as [key: T, value: U])

  for await (const [key, value] of iter) {
    map.set(key, value)
  }

  return map
}

export async function writeMapFile<T, U>(
  filename: string
, map: Map<T, U>
): Promise<void> {
  const text = new IterableOperator(map.entries())
    .map(x => JSON.stringify(x))
    .toArray()
    .join('\n')

  await fs.writeFile(filename, text + '\n')
}

export async function appendMapFile<T, U>(
  filename: string
, key: T
, value: U
): Promise<void> {
  await fs.appendFile(filename, JSON.stringify([key, value]) + '\n')
}
