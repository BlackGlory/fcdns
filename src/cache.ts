import { ensureDir } from 'extra-filesystem'
import { DiskCache, DiskCacheView } from 'extra-disk-cache'
import path from 'path'

export class Cache<T> {
  private constructor(
    private cache: DiskCache
  , private view: DiskCacheView<string, T>
  ) {}

  static async create<T>(
    filename: string
  ): Promise<Cache<T>> {
    await ensureDir(path.dirname(filename))

    const cache = await DiskCache.create(filename)
    const view = new DiskCacheView<string, T>(
      cache
    , {
        toString: x => x
      , fromString:  x => x
      }
    , {
        toBuffer: x => Buffer.from(JSON.stringify(x))
      , fromBuffer: buffer => JSON.parse(buffer.toString())
      }
    )

    return new Cache<T>(cache, view)
  }

  close(): void {
    this.cache.close()
  }

  get(key: string): T | undefined {
    const item = this.view.get(key)
    if (item) {
      return item.value
    } else {
      return undefined
    }
  }

  set(key: string, value: T): void {
    this.view.set(key, value, Date.now())
  }
}
