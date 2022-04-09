import { sha256 ,MBP } from '../src/otpus.js'

let msg = 'aaaaaaa'
let key = 'passphrase'

let enc = MBP.U8(msg)
let sum = sha256.hash( msg)
let hmac = sha256.hmac( key, msg)


prn( 'msg', MBP.hex( enc) )
prn( 'sum', MBP.hex( sum ) )
prn( 'hmac', MBP.hex(  hmac) )



function prn(...args){
    console.log(...args)
}

