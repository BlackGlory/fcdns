import Database from 'better-sqlite3'
import type { Database as IDatabase } from 'better-sqlite3'
import path from 'path'
import { ensureDirSync, findUpPackageFilename } from 'extra-filesystem'
import { assert } from '@blackglory/errors'
import { readMigrations } from 'migrations-file'
import { migrate } from '@blackglory/better-sqlite3-migrations'
import { isntUndefined } from '@blackglory/prelude'

let db: IDatabase

export function openDatabase(filename?: string): void {
  if (isntUndefined(filename)) {
    ensureDirSync(path.dirname(filename))

    db = new Database(filename)
  } else {
    db = new Database(':memory:')
  }
}

export async function prepareDatabase(): Promise<void> {
  assert(db, 'Database is not opened')
  await migrateDatabase(db)
}

export function getDatabase(): IDatabase {
  assert(db, 'Database is not opened')
  return db
}

export function closeDatabase(): void {
  if (db) {
    db.exec(`
      PRAGMA analysis_limit=400;
      PRAGMA optimize;
    `)
    db.close()
  }
}

async function migrateDatabase(db: IDatabase): Promise<void> {
  const pkgRoot = path.join((await findUpPackageFilename(__dirname))!, '..')
  const migrationsPath = path.join(pkgRoot, 'migrations')
  const migrations = await readMigrations(migrationsPath)
  migrate(db, migrations)
}
