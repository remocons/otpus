import { MBP, sha256, xotp , encryptMessage, decryptMessage } from '../src/otpus.js'
   
 
let encPack = encryptMessage('sercret message asdfgd', 'key')


prn( 'encMsg: A', encPack )

encPack = broke( encPack )

let decMsg = decryptMessage(encPack ,'key')


if( decMsg != undefined ){
    prn( 'decMsg:', decMsg )
}else{
    prn('wrong data')
}


function broke( dataOrg ){
    const data = Buffer.from(dataOrg, 'base64')
    // data[data.byteLength - 1] = 0
    // data[data.byteLength - 2] = 0

    return data.toString('base64')
}

// prn( 'encMsg', MBP.hex( encMsg )) 
   

function prn(...args){ 
    console.log(...args)
}
