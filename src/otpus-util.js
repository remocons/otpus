import { sha256 } from './otpus-sha256.js'
import { MBP, Buffer } from 'meta-buffer-pack'
import base64js from 'base64-js'
import { webcrypto } from 'crypto'

export { sha256, base64js, MBP, Buffer }
export let webCrypto

const encoder = new TextEncoder()
const decoder = new TextDecoder()

let isNode = false
try {
  isNode = Object.prototype.toString.call(global.process) === '[object process]'
} catch (e) { }

const verbose = false
try {
  if (isNode) {
    console.log('# node.js env:')
    webCrypto = webcrypto
    if (verbose) webCryptoTest()
  } else if (typeof importScripts === 'function') {
    webCrypto = self.crypto
    console.log('# Web Worker env')
    if (verbose) webCryptoTest()
  } else if (typeof document !== 'undefined') {
    webCrypto = window.crypto
    console.log('# browser env')
    if (verbose) webCryptoTest()
  }
} catch (error) {
  console.log('webCrypto err: ', error)
}

export function webCryptoTest () {
  if (typeof webCrypto.subtle !== 'object') {
    console.log('No WebCrypto API supported.')
  } else {
    console.log('webCrypto test:')
    const rand = webCrypto.getRandomValues(new Uint8Array(8))
    console.log('1. getRandomValues: ', rand)

    webCrypto.subtle.digest('SHA-256', rand).then(sum => {
      const hash1 = MBP.hex(sum)
      const hash2 = sha256.hex(rand)
      console.log('A.Compare binary hash sums')
      console.log('1. subtle.digest.sha256: ', hash1)
      console.log('2. js.sha256: ', hash2)
      if (hash1 === hash2) {
        console.log('binary hash test: success.')
      } else {
        throw new Error('diffrent hash result')
      }
    })
    const message = MBP.hex(rand)
    webCrypto.subtle.digest('SHA-256', encoder.encode(message)).then(sum => {
      const hash1 = MBP.hex(sum)
      const hash2 = sha256.hex(message)
      console.log('B.Compare string hash sums')
      console.log('1. subtle.digest.sha256: ', hash1)
      console.log('2. js.sha256: ', hash2)
      if (hash1 === hash2) {
        console.log('string hash test: success.')
      } else {
        throw new Error('diffrent hash result')
      }
    })
  }
}

export function getHashSpeed (n) {
  const t1 = performance.now()
  let buf = new Uint8Array(32)
  for (let i = 0; i < n; i++) {
    buf = sha256.hash(buf)
  }
  const ms = performance.now() - t1
  return (n * 1000 / ms).toFixed(0)
}

export function printHashPerformance (n) {
  const nps = getHashSpeed(n)
  let hashRate// = nps;
  for (let aMultiples = ['K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'], nMultiple = 0, nApprox = nps / 1024; nApprox > 1; nApprox /= 1024, nMultiple++) {
    hashRate = nApprox.toFixed(3) + ' ' + aMultiples[nMultiple] + 'H/s ( ' + nps + ' hash/sec )'
  }
  return 'sha256 hash power: ' + hashRate
}

//  test.
const rand = webCrypto.getRandomValues(new Uint8Array(8))
webCrypto.subtle.digest('SHA-256', rand).then(sum => {
  const hash1 = MBP.hex(sum)
  const hash2 = sha256.hex(rand)
  if (hash1 === hash2) {
    // console.log('hash test: success. speed:' + printHashPerformance(10000))
  } else {
    throw new Error('diffrent hash result')
  }
})
