import fs from 'fs/promises'

export async function readNDJSONMapFile<T, U>(
  filename: string
): Promise<Map<T, U>> {
  const text = await fs.readFile(filename, 'utf-8')
  const entries: Array<[key: T, value: U]> = text.split('\n')
    .filter(x => !!x)
    .map(x => JSON.parse(x))

  return new Map(entries)
}
