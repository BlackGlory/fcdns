import { TrieMap } from '@blackglory/structures'
import { IterableOperator, AsyncIterableOperator } from 'iterable-operator/lib/es2018/style/chaining'
import { promises as fs } from 'fs'
import { ensureFile, readFileLineByLine } from 'extra-filesystem'

export class Cache<T> {
  private buffer: Array<[string, T]> = []

  private constructor(
    private filename: string
  , private map: TrieMap<string, T>
  ) {}

  static async create<T>(
    filename: string
  ): Promise<Cache<T>> {
    await ensureFile(filename)

    const map = new TrieMap<string, T>()
    const iter = new AsyncIterableOperator(readFileLineByLine(filename))
      .filterAsync(x => !!x)
      .mapAsync(x => JSON.parse(x) as [key: string, value: T])

    for await (const [key, value] of iter) {
      map.set(key, value)
    }

    return new Cache<T>(filename, map)
  }

  get(key: string): T | undefined {
    return this.map.get(key)
  }

  /**
   * 新内容会进入缓冲区, 直到flush或write才会真正写入文件
   */
  set(key: string, value: T): void {
    if (!this.map.has(key)) {
      this.map.set(key, value)
      this.buffer.push([key, value])
    }
  }

  /**
   * 以追加在文件尾部的方式将缓冲区的内容写入文件, 清空缓冲区.
   */
  async flush(): Promise<void> {
    const text = this.buffer
      .map(([key, value]) => JSON.stringify([key, value]))
      .join('\n')

    await fs.appendFile(this.filename, text + '\n')

    this.buffer = []
  }

  /**
   * 将内存中的完整数据写入文件, 清空缓冲区.
   */
  async write(): Promise<void> {
    const text = new IterableOperator(this.map.entries())
      .map(([key, value]) => JSON.stringify([key.join(''), value]))
      .toArray()
      .join('\n')

    await fs.writeFile(this.filename, text + '\n')

    this.buffer = []
  }
}
