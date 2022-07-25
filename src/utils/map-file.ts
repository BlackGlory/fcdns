import { IterableOperator } from 'iterable-operator/lib/es2018/style/chaining'
import { promises as fs } from 'fs'
import { ensureFile } from 'extra-filesystem'

export async function readMapFile<T, U>(
  filename: string
): Promise<Map<T, U>> {
  await ensureFile(filename)
  const text = await fs.readFile(filename, 'utf-8')
  const entries: Array<[key: T, value: U]> = text.split('\n')
    .filter(x => !!x)
    .map(x => JSON.parse(x))

  return new Map(entries)
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
