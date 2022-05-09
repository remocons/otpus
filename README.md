# OTPUS

Cipher and tools for Node and Browser.  
( 범용 암호 구현 및 환경)

## Features

- Ready to development using Web Crypto API.
    - Isomorphic Web Crypto Name Reference(Node and Browser)
    - You can use isomorphic reference name of 'webCrypto' from otpus.
    - Node.js and Browser use different namespace.
- WebCrypto API based general purpose async style encryption functions
    - algorithm: AES-GCM, PBKDF2.
    - encrypt() : support any type of data and key.  
    - `random data size`
    - secret buffer pack ( meta buffer pack )
    - decrypt() : return `origin data type`.( thanks to the special feature of MBP)
- pure otpus implements
    - xotp() 
        - cipher function. based XOR and Pseudo OTP.
    - encryptMessage() 
        - simple but strong enough text message encryption.( `Use stong passphrase`)
        - recersive hash sum with salt.(like PBKDF2)
            - default. 1024 times accumulate hash sum.
        - `random data size`.(hide real message size.)
        - HMAC support. (detect corrupted message.)
        - output: base64 string.(simple handy universal data format)  
    - decryptMessage()
        - receive base64 encoded message.
        - return plain text.
        - return undefined. ( for corrupted message)
- include essential tools:
    - otpus.sha256 : [fast-sha256](https://github.com/dchest/fast-sha256-js) : sync type hash, hmac.  
    - otpus.base64js : [base64js](https://github.com/beatgammit/base64-js) : transcoder( buffer <-> UTF8 string ) 
    - otpus.MBP : [`meta buffer pack`]( https://github.com/make-robot/meta-buffer-pack) : buffer packer 
    - otpus.Buffer : [buffer](https://github.com/feross/buffer) : Node.js Buffer for browser. 




## Table of Contents

- [otpus](#otpus)
- [Features](#features)
- [Table of Contents](#table-of-contents)
- [Support](#support)
- [Usage](#usage)
  - [Installing](#installing)
  - [Loading module](#loading-module)
- [Sync functions](#sync-functions)
  - [encryptMessage()](#encryptmessage)
  - [decryptMessage()](#decryptmessage)
  - [Encoded data](#encoded-data)
  - [decryptMessage()](#decryptmessage-1)
  - [corruption check](#corruption-check)
  - [xotp()](#xotp)
- [Async functions using WebCrypto API](#async-functions-using-webcrypto-api)
  - [encrypt()](#encrypt)
  - [decrypt()](#decrypt)
  - [Error catch](#error-catch)
  - [Handling buffer](#handling-buffer)
- [Examples](#examples)
- [Online demo](#online-demo)
- [License](#license)


## Support
You can use modern ESM style or Legacy CJS, IIFE style both.
- NodeJS: 
    - ESM: src/index.js , dist/otpus.mjs (bundled version.)
    - CommonJS: dist/otpus.cjs
- Browser:
    - ESM: dist/otpus.esm.js
    - IIFE: dist/otpus.min.js

## Usage

### Installing

```
npm i otpus
```

### Loading module

```js
// browser IIFE in html
<script src="../dist/otpus.min.js"></script>

// browser ESM.  don't forget the fullpath and file extension.
import {encryptMessage, decryptMessage, xotp } from "../path/otpus.esm.js"

// NodeJS ESM
import {encryptMessage, decryptMessage, xotp } from "otpus"

// NodeJS CJS
// tip. if your pacakage.json using "module" type, you should use *.cjs file extension.
const {encryptMessage, decryptMessage, xotp } = require("otpus")

```

## Sync functions

### encryptMessage()
```js
encryptMessage( data: String , key: String , nPower: Number = 15 ) : String
```
General purpose text message encryption. 
- data: Any UTF8 string. 
- key: Any UTF8 string.
    - `please use long passPhrase.`
- nPower:   
    - factor for recursive hash sum counter
    - counter = 2 ** nPower 
    - counter is the result of exponentiation with number two as the base and integer nPower as the exponent.
    - default value is 15. ( 2 ** 15 => 32768 times)
    - `You can use high number for strong encryption`( but it takes more cpu time. )
    - example( on my device) 
      - mobile: 15 => spent about one second. 
      - desktop: 17 => spent about one second.
- output: encrytped and encoded base64 string.

### decryptMessage()
```js
decryptMessage( data: String, key: String ) : String

```
- data: base64 ecoded string data
- key: same with encryptMessage()
- output: plain text


### Encoded data

- encryptMessage() return base64 string data. 
- If you need buffer data. use Buffer.from( base64Msg, 'base64' ) method.
- or reverse command:  buffer.toString('base64')

```js

import {  encryptMessage, decryptMessage , Buffer } from 'otpus'
   
const plainText = 'this is sercret message'
const keyStr =  'this is secret key'

let encPack = encryptMessage( plainText, keyStr  )

// now encPack is encrypted & base64 encoded string.
/*  random size.
sX7SStdL/pF7umBBEJ7EKXuv7QYLflCe3vy9F+XEayQVfAVa3PoZ1UasXl
... SxbIm5Qb3dlciIsIjgiLDE0OF1dAE8=
*/

// if you need buffer data.
const encBuffer = Buffer.from( encPack , 'base64' )
// or reverse transformation ( from buffer to base64) also avaiable. 
const base64Pack = encBuffer.toString('base64')

let decMsg = decryptMessage(encPack ,keyStr )

if( decMsg  ){ // success
    // decMsg === 'this is sercret message'
}else{ 
    // decMsg === undefined  when fail. 
}

```


### decryptMessage() 
### corruption check 
- When encryption process is fail for any reason. it will return undefined.
- The encryption data store HMAC ( hash of message and key) info inside.
- If calculated hmac is dismatched with stored hmac then return undefined.
- Try this example. See the result when modify one byte of encryption data.

```js

import {  encryptMessage, decryptMessage } from 'otpus'
   
const plainText = 'this is sercret message'
const keyStr =  'this is secret key'

let encPack = encryptMessage( plainText, keyStr  )

encPack = messageModification( encPack) //try make corrupted message.

let decMsg = decryptMessage(encPack ,keyStr )

if( decMsg  ){ // success
    console.log( 'decMsg:', decMsg )
}else{ // return undefined  when fail. 
    console.log('wrong data')
}

function messageModification( dataOrg ){
    const data = Buffer.from(dataOrg, 'base64')
    data[10] ^= 0x01; // modify one byte
    return data.toString('base64')
}

```

### xotp()

This function is base cipher algorithm for otpus.( using XOR and Pseudo OTP.)  You can make other encryption function( like encyptMessage) using this function.

```js

xotp( data: Uint8Array, otpKey32Bytes: Uint8Array, otpSartIndex: Number = 0, shareDataBuffer: boolean = false ) : Uint8Array

```
- Using encryption and decryption both.
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

// use case 1. shareDataBuffer is false. 
let enc = xotp( data ,otpKey, 0 )  // false default.
let dec = xotp( enc , otpKey, 0 ) 

// use case 2. shareDataBuffer is true.
let encShare = xotp( data ,otpKey, 0 , true)  
// encShare & data is reference of same arrayBuffer.

// when shareOption is true.
// no return value needed. ( same below.)

// data before encryption.
xotp( data , otpKey, 0, true)
// now input data is changed.  
xotp( data , otpKey, 0 , true)
// now data is decrypted.

```

## Async functions using WebCrypto API

**Secure context**: This feature is available only in secure contexts (HTTPS), in some or all supporting browsers. [MDN SubtleCrypto](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)  
**Node.js**: The Web Cryptography API implementation has landed as an experimental feature in Node.js 15.0.0.( current status: Stability: 1 - Experimental.) [Implementing the Web Cryptography API for Node.js Core](https://www.nearform.com/blog/implementing-the-web-cryptography-api-for-node-js-core/)

### encrypt()

otpus's general purpose encryption implement using Web Crypto API.

 features:
- any type of data.
- any type of key( passPhrase). `string passphrase or buffer`
- result of decryption data will be same data type of origin data.
- randomize data size. (to hide real message size)
- Using WebCrypto API
    - encryption algorithm:  AES-GCM  of Webcrypto API.
        - support message authentication
    - key generation:  PBKDF2 of WebCrypto API.
    - salt, iv:  from getRandomValues
- data packaging:  MBP(meta-buffer-pack) 
  
```js
  encrypt( data: any , passPhrase: any ,iterations : Number = 32768 ) bufferPack: Promise
```
 - async version of otpus.encrytMessage() 
    - available: promise chaining, async await.
 - input
    - data {Stinrg | Uint8Array | Number | Object } 
    - passPhrase {Stinrg | Uint8Array | Number | Object } 
    - iterations {Number} iterations for PBKDF2 ( default 32768.) 
 - returns 
    - Promise ( will return bufferPack when fulfilled )  
    - bufferPack is Node.js Buffer( subclass of Uint8Array)

  

### decrypt()

```js
  decrypt(data:Uint8Array , passPhrase: any  ) decodeData: Promise 
```

 - input
    - bufferPack(MBP pack) {Uint8Array} 
    - passPhrase  {String | Uint8Array | any } 
 - returns 
    - Promise ( will return decodedData when fulfilled )

```js
import { encrypt, decrypt ,Buffer } from "otpus"

// async await style
const plainText = 'this is a secret message.'
const encPack = await encrypt(plainText, 'passPhrase', 10000)
const decodeMessage = await decrypt(encPack, 'passPhrase')

console.log('decrypted:', decodeMessage)

const plainData = Buffer.alloc(100 * 2 ** 20)
const encData = await encrypt(plainData, 'passPhrase', 10000)
const decData = await decrypt(encData, 'passPhrase')

const some = decData.slice(0, 16)
console.log('decrypted: some:', some)
console.log('decrypted: byteLength:', decData.byteLength)

const key = 'key'
const strData = 'hello world'


// promise chaining

// string data will return string data. 
encrypt(strData, key)
  .then(secretPack => {
    console.log('secretPack', secretPack.byteLength)
    return decrypt(secretPack, key)
  })
  .then(data => {
    console.log( 'typeof data:', typeof data)  // string 
    console.log('decoded string message: ', data)
  })


// Uint8Array data will return Uint8Array data.
const binaryData = Uint8Array.from([1, 2, 3, 4])
encrypt(binaryData, key)
  .then(secretPack => {
    console.log('secretPack', secretPack.byteLength)
    return decrypt(secretPack, key)
  })
  .then(data => {
    console.log('instanceof Uint8Array:', data instanceof Uint8Array )  //true
    console.log('decoded binary data: ', data)
  })

```
### Error catch

For many reason encryption process could be fail.
You should use try, catch statements.

```js
//  await style
try{
    const secretPack = await encrypt('plain text','key')
    const decoded = await decrypt( secretPack,'key')
    console.log('decoded:', decoded)
}catch(error){
    console.log(error)
}

// Promise style
encrypt('plain text','key')
    .then( secretPack => decrypt(secretPack, 'key' ) )
    .then( decoded => console.log( decoded ))
    .catch( error=>{
        console.log(error)
    })

```

### Handling buffer

encrypt() function generate a buffer( meta-buffer-pack).
You can transform data format.

```js

import{ encrypt, decrypt, MBP } from 'otpus'

const secretPack = await encrypt('data','key')

// secretPack is Buffer ( subclass of Uint8Array)
console.log( secretPack instanceof Uint8Array ) //  true 

// case. If you need base64 string data. 
const base64Pack = secretPack.toString('base64')
console.log( 'base64 data:', base64Pack ) 

/*
base64 data: F59Pyfq8EOSVSprdvbI2U+46JGtpcQ0sa3W2YtGRBxdJTdT41GY6a+FfBIvT4byChSu1KTGP1PJXewTidfeN1dgQh2IAe+eB2f/Df64kBXdr7HcvMFbawu2tOuUzUsonluKK25J5ilUtpuF2qszf9DEwMDAwW1siZW5jRGF0YSIsIkIiLDAsODRdLFsiaXYiLCJCIiw4NCwxMl0sWyJzYWx0IiwiQiIsOTYsMTZdLFsiaXRlcmF0aW9ucyIsIk4iLDExMiw1XV0AUw==
*/

// secretPack is meta-buffer-pack of MBP.
// You can use  MBP.unpack() to check public information like iv , salt.
cosnt secretObject = MBP.unpack( secretPack )
console.log( 'salt:', sercretObject.salt ) // 16 bytes. random values.

// salt: <Buffer 96 e2 8a db 92 79 8a 55 2d a6 e1 76 aa cc df f4>

```


### Examples
- NodeJs: please check test, testing directory.
- Browser: example directory.


### Online demo 
- [https://congtrol.github.io/otpus/example/]( https://congtrol.github.io/otpus/example/)

### license
[ISC](LICENSE) Donegeun Lee 이동은 <sixgen@gmail.com>