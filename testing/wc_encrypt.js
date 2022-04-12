import { webCrypto, sha256, RAND, MBP, hexlog } from "../src/otpus.js";

const wc = webCrypto.subtle

/*
general encryption : using WebCrypto API only. 

building cryptoKey.

1. input: string key
 process.
 - generate salt: using getRandomValues()
 - generate cryptoKey for webcrypto. using importKey()

 how build cryptoKey for WebCrypto encrypt
  from: generateKey(), deriveKey(), importKey(), or unwrapKey().


  1. imporkKey 'raw' :   *use secure data. 
  2. importKey 'PBKDF2' 
  2. deriveKey 


  deriveBits()는 기존 키에서 버퍼를 추출
  deriveKey 는 키에서 키 추출.


  Rule 1. Wecrypto method use CryptoKey object.


*/



// // string key
// const strKey = 'key'

// const rawKey = otpus.RAND( 32 )

// // AES_GCM 암호화.

// //1. AES_GCM 전용 키 생성.

// // getGCM_KEY ( keyBuffer )
// const key_AES_GCM = await wc.importKey(
//     'raw',   // 직접 생성한 버퍼로 생성가능.
//     rawKey,   // Buffer Source.
//     'AES-GCM',  // 암호화 방식 확정
//     false,       //파생키 추출 허용여부
//     ['encrypt'] //암호화 방식 확정.
//     )

// // 2. encrypt 수행
// const inputBuffer = MBP.U8('aaaaaaaaaaaaaaaa')

// // encrytGCM  (iv , data)
// const output = await wc.encrypt(
//     { name: 'AES-GCM',  //알고리즘 지정
//     iv: RAND(12) },  // iv값. 12바이트.
//     key_AES_GCM,   // 전용키
//     inputBuffer)    //암호화 버퍼. 

// // importKey  'raw' 

// hexlog('input', inputBuffer)
// hexlog('output', output)

// const keyPBKDF2 = await getU8RawKeyByPBKDF2( 'key', 'salt', 1000 )

// hexlog('keyBBKDF2', keyPBKDF2)


// // importKey  'raw'  for 'deriveBits'

// // deriveBits 
// // nTimesHash 유사 기능. but  표준 PBKDF2사용 
// // importKey  1차로 raw자료로 키생성후 PBKDF2 에 전달. 
// function getU8RawKeyByPBKDF2 (keySrc, saltSrc, ntime) {
//     return wc.importKey(
//       'raw',
//       sha256.hash(keySrc), 
//       { name: 'PBKDF2' },
//       false,
//       ['deriveBits']
//     ).then(function (rawKey) {
//       return wc.deriveBits(  // return arrayBuffer
//         {
//           name: 'PBKDF2',
//           salt: sha256.hash(saltSrc).slice(0, 16),
//           iterations: ntime,
//           hash: 'SHA-256'
//         },
//         rawKey,
//         256
//       )
//     }).then( arrayBuffer => {
//       return new Uint8Array(arrayBuffer)  // return Uint8
//     })
//   }


/**
 * general purpose encryption. 
 * using WebCrypto API. 
 * 
 * encryption algorithm:  AES-GCM  of Webcrypto API.
 * key generation:  PBKDF2 of WebCrypto API.
 * salt, iv:  from getRandomValues
 * 
 * packaging:  MBP(meta-buffer-pack)
 * 
 * @param {Stinrg | Uint8Array} data 
 * @param {String} passPhrase 
 * @param {Number} iterations default 10000. for PBKDF2
 * @returns {Promise} bufferPack (will return when fulfilled)  
 * bufferPack is Buffer( subclass of Uint8Array)
 */
async function encrypt(data, passPhrase, iterations = 10000) {

  const isString = (typeof data === 'string') // hint for unpack.   
  const salt = RAND(16)  // at least 16Bytes  https://developer.mozilla.org/en-US/docs/Web/API/Pbkdf2Params
  const iv = RAND(12) // recommended 12Bytes https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams
  // otpus.RAND(size) is shortcut of getRandomValues( new Uint8Array(size) )

  const rawKey = await wc.importKey(
    "raw",
    MBP.U8(passPhrase),  // MBP.U8() return Uint8Array for any data types.  ex. string -> return encoded(UTF8)     
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await wc.deriveKey(
    {
      "name": "PBKDF2",
      salt: salt,
      "iterations": iterations,
      "hash": "SHA-256"
    },
    rawKey,
    { "name": "AES-GCM", "length": 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const encData = await wc.encrypt(
    {
      name: "AES-GCM",
      iv: iv
    },
    key,
    data
  );

  // hexlog('salt',salt)
  // hexlog('iv',iv)
  // hexlog('encData',encData )

  return MBP.pack(
    MBP.MB('encData', encData),
    MBP.MB('iv', iv),
    MBP.MB('salt', salt),
    MBP.MB('iterations', iterations),
    MBP.MB('isString', isString)
  )

}




async function decrypt(encPack, passPhrase) {

  const pack = MBP.unpack(encPack)
  console.log('isString', pack.isString)

  const rawKey = await wc.importKey(
    "raw",
    MBP.U8(passPhrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  const key = await wc.deriveKey(
    {
      "name": "PBKDF2",
      salt: pack.salt,
      "iterations": pack.iterations,
      "hash": "SHA-256"
    },
    rawKey,
    { "name": "AES-GCM", "length": 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const decData = await wc.decrypt(
    {
      name: "AES-GCM",
      iv: pack.iv
    },
    key,
    pack.encData
  );


  if (pack.isString) {
    return new TextDecoder().decode(decData)
  }

  return decData

}



const plainText = 'this is secret message.'
const encPack = await encrypt(plainText, 'passPhrase', 10000)
const decodeMessage = await decrypt(encPack, 'passPhrase')

console.log('decrypted:', decodeMessage)


const plainData = Buffer.alloc(100 * 2 ** 20)
const encData = await encrypt(plainData, 'passPhrase', 10000)
const decData = await decrypt(encData, 'passPhrase')

const some = decData.slice(0, 16)
console.log('decrypted:', some)
console.log('decrypted:', decData.byteLength)

const key = 'key'
const strData = 'hello world     '

encrypt(strData, key)
  .then(secretPack => {
    console.log('secretPack', secretPack.byteLength)
    return decrypt(secretPack, key)
  })
  .then(data => {
    console.log('decoded string message: ', data)
  })


const binaryData = Uint8Array.from([1, 2, 3, 4,5,6])
encrypt(binaryData, key)
  .then(secretPack => {
    console.log('secretPack', secretPack.byteLength)
    return decrypt(secretPack, key)
  })
  .then(data => {
    console.log('decoded binary data: ', data)
  })
