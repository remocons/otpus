# otpus

## features

- Ready to development using Web Crytop API.
    - Isomorphic Web Crypto Name Reference(Node and Browser)
    - NodeJS and Browser use different namespace.
    - You can use isomorphic name of 'webCrypto' from otpus.
- xotp() 
    - cipher function. based XOR with Secure Hash based Pseudo OTP.
- encryptMessage() 
    - simple but strong enough text message encryption.(`!!!use stong passphrase`)
    - recersive hash sum with salt.(like PBKDF2)
        - default. 1024 times accumulate hash sum.
    - random message size.(hide real message size.)
    - HMAC support. (detect corrupted message.)
    - output base64 string.  
- decryptMessage()
    - receive base64 encoded message.
    - return plain text.
    - return undefined. ( for corrupted message)
- include:
    - SHA256() ,HMAC()  ( sync type )
    - base64() 
    - MBP(meta buffer pack) : buffer pack tool.

## support
You can use modern ESM style or Legacy CJS, IIFE style both.
- NodeJS: 
    - ESM: dist/otpus.mjs (bundle version.)
    - CommonJS: dist/otpus.cjs
- Browser:
    - ESM: dist/otpus.esm.js
    - IIFE: dist/otpus.min.js


## Usage

### install

```js
npm i otpus

```

### encrytMessage()
```js
encrytMessage( data: string , key: string ) : string
```
General purpose simple text message encrytion.  (no strict)
- data: Any UTF8 text string 
- key: Any UTF8 tex string. (any size)
- output: encrytped and encoded base64 string.

```js
encryptMessage( data: string, key: string )

```

```js

import {  encryptMessage, decryptMessage } from 'otpus'
   
const plainText = 'this is sercret message'
const keyStr =  'this is secret key'

let encPack = encryptMessage( plainText, keyStr  )

// now encPack is encrypted & base64 encoded string.
// sX7SStdL/pF7umBBEJ7EKXuv7QYLflCe3vy9F+XEayQVfAVa3PoZ1UasXl
//... SxbIm5Qb3dlciIsIjgiLDE0OF1dAE8=
// return data is always change.  and size is not fixed.

let decMsg = decryptMessage(encPack ,keyStr )


if( decMsg  ){ // success
    // decMsg === 'this is sercret message'
}else{ 
    // decMsg === undefined  when fail. 
}



```


### decryptMessage() corruption check 
- When encryption process is fail for any reason. it will return undefined.
- The encryption data store HMAC ( hash of message and key) info inside.
- If calculated hmac is distmatched with stored hmac then return undefined.
- Try this example. See the result when modify one single bit of encryption data.

```js

import {  encryptMessage, decryptMessage } from 'otpus'
   
const plainText = 'this is sercret message'
const keyStr =  'this is secret key'

let encPack = encryptMessage( plainText, keyStr  )

encPack = broke( encPack )  //try make corrupted message. (change one bit.)

let decMsg = decryptMessage(encPack ,keyStr )

if( decMsg  ){ // success
    prn( 'decMsg:', decMsg )
}else{ // return undefined  when fail. 
    prn('wrong data')
}

function broke( dataOrg ){
    const data = Buffer.from(dataOrg, 'base64')
    data[10] ^= 0x01; // modify 1 bit. 
    return data.toString('base64')
}


function prn(...args){ 
    console.log(...args)
}


```


### xotp()
```js
xotp( data: Uint8Array, otpKey32Bytes: Uint8Array, otpSartIndex = 0:Number, shareDataBuffer = false : boolean) : Uint8Array

```
This function is base cipher algorithm for otpus.( using XOR and Pseudo OTP.)  You can make other encryption function( like encyptMessage) using this function.
- used for encryption and decryption same.
- data: Uint8Array only.
- key: 32bytes Uint8Array only.
- otpStartIndex: Number( 0 ~ 2**32-1.) default. 0
- shareDataBuff: `important`
    - false: return new buffer. default.
        - recommended for small size data.
    - true: modify input data buffer.
        - recommended for the large data. 

```js
import { MBP, sha256, xotp  } from 'otpus'
   
const msgStr = 'aaaaaaaaaaaa'   
const pwStr = 'passphrase'    
  
let otpKey = sha256.hash( pwStr)  
// return 32bytes Uint8Array from string data.
let data = MBP.U8( msgStr )  
// MBP.U8(): parse any type of data into Uint8Array 


// 1. shareDataBuffer is false. 
let enc = xotp( data ,otpKey, 0 )  // false default.
let dec = xotp( enc , otpKey, 0 ) 

// 2. shareDataBuffer is true.
let encShare = xotp( data ,otpKey, 0 , true)  
// encShare & data is referece same arrayBuffer.

// when shareOption is true.
// no return value needed. ( same below.)

// data before encryption.
xotp( data , otpKey, 0, true)
// now data is changed(encrypted | decrypted)
xotp( data , otpKey, 0 , true)
// now decrypted.


```



