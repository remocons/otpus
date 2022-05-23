
export class VirtualBuffer {
  constructor (algorithm = '8') {

    if (typeof algorithm === 'string') this.name = algorithm

    if (algorithm === '8') {
      this.algorithm = this.uint8ArrayIncrementIndex
    } else if (algorithm === '16') {
      this.algorithm = this.uint16ArrayIncrementIndex
    } else if (algorithm === '16LE') {
      this.algorithm = this.uint16ArrayIncrementIndexLE
    } else {
      this.algorithm = algorithm
    }
  }

  uint8ArrayIncrementIndex (offset, length) {
    const data = new Uint8Array(length)
    const firstValue = offset % 256
    for (let i = 0; i < length; i++) {
      data[i] = firstValue + i
    }
    return data
  }

  uint16ArrayIncrementIndexLE (offset, length) {
    return this.uint16ArrayIncrementIndex(offset, length, true)
  }

  uint16ArrayIncrementIndex (offset, length, littleEndian = false) {
    // 단위크기(2바이트) 단위보다 작은경우,  2바이트를 추가로 생성해야한다.
    const byteUnit = 2
    let beforeAdd = 0
    let afterAdd = 0

    if ((offset % byteUnit) !== 0) {
      beforeAdd = 1
    }
    if (((offset + length) % byteUnit) !== 0) {
      afterAdd = 1
    }
    const beginIndex = (offset - beforeAdd) / byteUnit
    const lastIndex = (offset + length + afterAdd) / byteUnit
    const indexLength = lastIndex - beginIndex

    const data = new Uint8Array(length + beforeAdd + afterAdd)
    const INDEX_MAX = (256 ** byteUnit)// 65536

    const view = new DataView(data.buffer)
    let startValue = beginIndex

    console.log(this.name, beginIndex, lastIndex, startValue)
    for (let i = 0; i < indexLength; i++, startValue++) {
      view.setUint16(i * byteUnit, startValue % INDEX_MAX, littleEndian)
    }

    const out = new Uint8Array(data.buffer, beforeAdd, length)
    return out
  }

  read (offset, length) {
    return this.algorithm(offset, length)
  }

  hex (offset, length) {
    return this.buf2hex(this.algorithm(offset, length))
  }

  buf2hex (buffer) { return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('') }
}
