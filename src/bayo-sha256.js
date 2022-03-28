import {hash as sha256 , hmac } from '../lib/fast-sha256.js'
// export * from '../lib/fast-sha256.js'

// console.log('bayo-sha256', sha256)
const encoder = new TextEncoder()
const decoder = new TextDecoder()

sha256.arrayBuffer = function (data) {
  let type = 'unknown'
  if (typeof data === 'string') {
    type = 'string'
    data = encoder.encode(data)
  } else if (ArrayBuffer.isView(data)) {
    if (data.constructor.name === 'Uint8Array') {
      type = 'typedarray'
    } else {
      throw new Error('Use Uint8Array')
    }
  } else if (data.constructor === ArrayBuffer) {
    type = 'arraybuffer'
    data = new Uint8Array(data)
  } else {
    throw new Error('unsupported data type')
  }
  return sha256(data).buffer
}

sha256.hex = function (data) {
  const sum = sha256.arrayBuffer(data)
  return buf2hex(sum)
}

sha256.hmac = function (key,data) {
  if (typeof data === 'string') {
    data = encoder.encode(data)
  } else if (ArrayBuffer.isView(data)) {
    if (data.constructor.name === 'Uint8Array') {
    } else {
      throw new Error('Use Uint8Array')
    }
  } else if (data.constructor === ArrayBuffer) {
    data = new Uint8Array(data)
  } else {
    throw new Error('unsupported data type')
  }

  if (typeof key === 'string') {
    key = encoder.encode(key)
  } else if (ArrayBuffer.isView(key)) {
    if (key.constructor.name === 'Uint8Array') {
    } else {
      throw new Error('Use Uint8Array')
    }
  } else if (key.constructor === ArrayBuffer) {
    key = new Uint8Array(key)
  } else {
    throw new Error('unsupported key type')
  }
  return hmac(key,data)
  
}  

function buf2hex (buffer) { return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('') }

export { sha256 }
