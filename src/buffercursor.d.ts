declare module 'buffercursor' {
  export default class BufferCursor {
    constructor(buffer: Buffer, noAssert: boolean = true)

    _pos: number
    _noAssert: boolean
    buffer: Buffer
    length: number

    seek(pos: number): this
    eof(): boolean
    toByteArray(method: string): number[]
    tell(): number
    slice(length: number): BufferCursor
    toString(encoding: string = 'utf8', length: number): string
    write(value: string, length: numer, encoding: string): this
    fill(value: string, length?: number): this
    copy(source: BufferCursor | Buffer, sourceStart: number, sourceEnd: number): this

    readUInt8(): number
    readInt8(): number
    readInt16BE(): number
    readInt16LE(): number
    readUInt16BE(): number
    readUInt16LE(): number
    readUInt32LE(): number
    readUInt32BE(): number
    readInt32LE(): number
    readInt32BE(): number
    readFloatBE(): number
    readFloatLE(): number
    readDoubleBE(): number
    readDoubleLE(): number

    writeUInt8(value: number): this
    writeInt8(value: number): this
    writeUInt16BE(value: number): this
    writeUInt16LE(value: number): this
    writeInt16BE(value: number): this
    writeInt16LE(value: number): this
    writeUInt32BE(value: number): this
    writeUInt32LE(value: number): this
    writeInt32BE(value: number): this
    writeInt32LE(value: number): this
    writeFloatBE(value: number): this
    writeFloatLE(value: number): this
    writeDoubleBE(value: number): this
    writeDoubleLE(value: number): this
  }
}
