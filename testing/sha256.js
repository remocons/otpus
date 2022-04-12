import { sha256, MBP } from '../src/otpus.js'

const msg = 'aaaaaaa'
const key = 'passphrase'

const enc = MBP.U8(msg)
const sum = sha256.hash(msg)
const hmac = sha256.hmac(key, msg)

prn('msg', MBP.hex(enc))
prn('sum', MBP.hex(sum))
prn('hmac', MBP.hex(hmac))

function prn (...args) {
  console.log(...args)
}
