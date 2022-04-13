# otpus

Cipher and tools for Node and Browser.  
암호 구현 및 지원 도구
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

### loading module
- bundled modules is inside dist folder.
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

### encryptMessage()
```js
encryptMessage( data: String , key: String ) : String
```
General purpose simple text message encrytion. 
- data: Any UTF8 text string 
- key: Any UTF8 tex string. (any size)
- output: encrytped and encoded base64 string.

### decryptMessage()
```js
decryptMessage( data: String, key: String ) : String

```
- data: base64 ecoded string data
- key: same with encryptMessage
- output: plain text


### example 1. normal

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


### example 2.  decryptMessage() corruption check 
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
    prn( 'decMsg:', decMsg )
}else{ // return undefined  when fail. 
    prn('wrong data')
}

function messageModification( dataOrg ){
    const data = Buffer.from(dataOrg, 'base64')
    data[10] ^= 0x01; // modify one byte
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

## Using Web Crypto API

**Secure context**: This feature is available only in secure contexts (HTTPS), in some or all supporting browsers.  
**Node.js**: The Web Cryptography API implementation has landed as an experimental feature in Node.js 15.0.0.( current status: Stability: 1 - Experimental.)

### otpus.encrypt()

otpus's general purpose encryption implement using Web Crypto API.

 features:
- any type of data
- any type of key( passPhrase).
- result of decryption data will be same data type of origin data.
- randomize data size. (to hide real message size)
- Using WebCrypto API
    - encryption algorithm:  AES-GCM  of Webcrypto API.
        - support message authentication
    - key generation:  PBKDF2 of WebCrypto API.
    - salt, iv:  from getRandomValues
- data packaging:  MBP(meta-buffer-pack)  https://github.com/make-robot/meta-buffer-pack
  
```js
  encrypt(data:any , passPhrase: any ,iterations:Number = 10000 ) bufferPack: Promise 
```
 - async version of otpus.encrytMessage() 
    - available: promise chaining, async await.
 - input
    - data {Stinrg | Uint8Array | Number | Object } 
    - passPhrase {Stinrg | Uint8Array | Number | Object } 
    - iterations {Number} iterations default 10000. for PBKDF2
 - returns 
    - Promise ( will return bufferPack when fulfilled )  
    - bufferPack is Node.js Buffer( subclass of Uint8Array)

  

### otpus.decrypt()

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
    console.log('instanceof ArrayBuffer:', data instanceof Uint8Array )  //true
    console.log('decoded binary data: ', data)
  })


```

### handling encryption data ( bufferPack )

result of encrypt() data is Buffer. 

```js
// It's Uint8Array.

// It has some utility methodes.

// case 1. If you need base64 string.

const secretBase64 = bufferPack.toString('base64')
// now secreBase64 is String.






```



### examples
- NodeJs: inside test, testing directory.
- Browser: example directory.
- [online demo @github]( https://make-robot.github.io/otpus/example/)


### license
[MIT](LICENSE)  
