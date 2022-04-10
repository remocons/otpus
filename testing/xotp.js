import { MBP, sha256, xotp  } from '../src/otpus.js'
   
const msgStr = 'aaaaaaaaaaaa'   
const pwStr = 'passphrase'    
  
let otpKey = sha256.hash( pwStr)  // return 32bytes Uint8Array from string data.
let data = MBP.U8( msgStr )  // MBP.U8(): parse any type of data into Uint8Array 


// 1. shareDataBuffer is false. 
let enc = xotp( data ,otpKey, 0 )  
let dec = xotp( enc , otpKey, 0 ) 

// 2. shareDataBuffer is true.
let encShare = xotp( data ,otpKey, 0 , true)  
// encShare & data is typedArray that share same arrayBuffer.

// when shareOption is true.
// no return value needed. ( same below.)

// data before 
xotp(data, otpKey, 0, true)
// now data is changed by xotp.
xotp( data , otpKey, 0 , true)
// now decrypted.
 
prn('enc',MBP.hex( enc ) )
prn('dec',MBP.hex( dec ) )
    
   
function prn(...args){ 
    console.log(...args)
}
