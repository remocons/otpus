import { sha256 ,MBP ,xotp} from '../src/otpus.js'

const msg = 'aaaaaaaaaaaa'
const key = 'passphrase'

// let sum = sha256.hash( msg)
// let hmac = sha256.hmac( key, msg)


// prn( 'sum', MBP.hex( sum ) ) 
// prn( 'hmac', MBP.hex(  hmac) )
  

// let enc = xotpcp(msg ,'key') 
// let dec = xotpcp(enc ,'key')

// prn('enc',MBP.hex( enc ) )
// prn('dec',MBP.hex( dec ) )
 


function encryptStr( msg , key){

}



let enc2 = xotp(msg ,key)
let dec2 = xotp(enc2 ,key)

prn('msg',msg )
prn('enc2',MBP.hex( enc2 ) )
prn('dec2',dec2 )
  
 
function prn(...args){
    console.log(...args)
}

