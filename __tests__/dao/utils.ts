import {
  openDatabase
, prepareDatabase
, getDatabase
, closeDatabase
} from '@src/database.js'

export async function initializeDatabase(): Promise<void> {
  openDatabase(':memory:')
  await prepareDatabase()
}

export function clearDatabase(): void {
  closeDatabase()
}

interface IRawHostname {
  hostname: string
  route_result: number | null
  poison_test_result: number | null
}

export function setRawHostname(raw: IRawHostname): void {
  getDatabase().prepare(`
    INSERT INTO hostname(
                  hostname
                , route_result
                , poison_test_result
                )
         VALUES ($hostname, $route_result, $poison_test_result)
  `).run(raw)
}

export function getRawHostname(hostname: string): IRawHostname {
  return getDatabase().prepare(`
    SELECT *
      FROM hostname
     WHERE hostname = $hostname
  `).get({ hostname })
}

export function hasRawHostname(hostname: string): boolean {
  const result: { hostname_exists: 1 | 0 } = getDatabase().prepare(`
    SELECT EXISTS(
             SELECT *
               FROM hostname
              WHERE hostname = $hostname
           ) AS hostname_exists
  `).get({ hostname })

  return result.hostname_exists === 1
}
