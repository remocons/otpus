import {  encryptMessage, decryptMessage } from '../src/otpus.js'
   
 
const plainText = 'this is sercret message'
const keyStr =  'this is secret key'

let encPack = encryptMessage( plainText, keyStr  )


prn( 'encMsg: A', encPack )

// encPack = messageModification( encPack )

let decMsg = decryptMessage(encPack ,keyStr )


if( decMsg  ){ // success
    prn( 'decMsg:', decMsg )
}else{ // return undefined  when fail. 
    prn('data is corrupted.')
}


function messageModification( dataOrg ){
    const data = Buffer.from(dataOrg, 'base64')
    data[10] ^= 0x01; // modify one byte.
    return data.toString('base64')
}


// prn( 'encMsg', MBP.hex( encMsg )) 
   

function prn(...args){ 
    console.log(...args)
}
