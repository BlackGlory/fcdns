import { fileURLToPath } from 'node:url'
import { readJSONFileSync, findUpPackageFilenameSync } from 'extra-filesystem'
import { assert, isString } from '@blackglory/prelude'
import path from 'path'

const pkgFilename = findUpPackageFilenameSync(
  fileURLToPath(new URL(import.meta.url))
)
assert(pkgFilename, 'The package.json is not found')

export const pkgDirname = path.dirname(pkgFilename)

const pkg = readJSONFileSync<Record<string, string>>(pkgFilename)

export const name = pkg.name
assert(isString(name), 'The name is not found in package.json')

export const description = pkg.description
assert(isString(description), 'The description is not found in package.json')

export const version = pkg.version as `${number}.${number}.${number}`
assert(isString(version), 'The version is not found in package.json')
assert(/^\d+\.\d+\.\d+$/.test(version), 'The version is invalid')
