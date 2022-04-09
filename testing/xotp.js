import { MBP, sha256, xotp , encryptMsgPack , decryptMsgPack} from '../src/otpus.js'
   
 
const msgStr = 'aaaaaaaaaaaa'   
const pwStr = 'passphrase'    
  
let otpKey = sha256.hash( pwStr) 
let data = MBP.U8( msgStr )   

let hmac = sha256.hmac( otpKey, data ) 
 
// prn( 'hmac', MBP.hex(  hmac) )  
       
  
let enc = xotp( data ,otpKey, 0xffff0000 )  
let dec = xotp( enc , otpKey, 0xffff0000 ) 
// let enc = xotp( data ,otpKey, 0xffff0000 , true)  
// let dec = xotp( enc , otpKey, 0xffff0000 , true)
 
prn('enc',MBP.hex( enc ) )
prn('dec',MBP.hex( dec ) )
    
 
let encPack = encryptMsgPack('sercret message asdfgd', 'key')
prn( 'encMsg:', encPack )
       
let decMsg = decryptMsgPack(encPack ,'key')
prn( 'decMsg:', decMsg )

// prn( 'encMsg', MBP.hex( encMsg )) 
   

function prn(...args){ 
    console.log(...args)
}

   // webCryptoTest();     
// prn('rand4', webCrypto.getRandomValues(new Uint8Array(4)))      