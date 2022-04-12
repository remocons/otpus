import { MBP, sha256, xotp } from '../src/otpus.js'

const msgStr = 'aaaaaaaaaaaa'
const pwStr = 'passphrase'

const otpKey = sha256.hash(pwStr) // return 32bytes Uint8Array from string data.
const data = MBP.U8(msgStr) // MBP.U8(): parse any type of data into Uint8Array

// when shareDataBuffer is false.
const enc = xotp(data, otpKey, 0)
const dec = xotp(enc, otpKey, 0)

// when shareDataBuffer is true.
const encShare = xotp(data, otpKey, 0, true)
// encShare & data is typedArray that share same arrayBuffer.

// when shareOption is true.
// no return value needed. ( same below.)

// data before
xotp(data, otpKey, 0, true)
// now data is changed by xotp.
xotp(data, otpKey, 0, true)
// now decrypted.

prn('enc', MBP.hex(enc))
prn('dec', MBP.hex(dec))

function prn (...args) {
  console.log(...args)
}
