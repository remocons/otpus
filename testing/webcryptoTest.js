import * as otpus from "../src/otpus.js";

const wc = otpus.webCrypto.subtle
const sha256 = otpus.sha256

// webcrypto data types : 
// params: BufferSource( ArrayBuffer ,TypedArray, DataView )( https://webidl.spec.whatwg.org/#idl-buffer-source-types )
// return: ArrayBuffer

const strKey = 'key'
const rawKey = otpus.RAND( 32 )

// getGCM_KEY ( keyBuffer )
const key_AES_GCM = await wc.importKey(
    'raw',   
    rawKey,   // Buffer Source.
    'AES-GCM',  
    false,       
    ['encrypt'] 
    )

// 2. encrypt 
const inputBuffer = otpus.MBP.U8('aaaaaaaaaaaaaaaa')

// encrytGCM  (iv , data)
const output = await wc.encrypt(
    { name: 'AES-GCM',  
    iv: otpus.RAND(12) }, 
    key_AES_GCM,  
    inputBuffer)    

// importKey  'raw' 

otpus.hexlog('input', inputBuffer)
otpus.hexlog('output', output)

const keyPBKDF2 = await getU8RawKeyByPBKDF2( 'key', 'salt', 1000 )

otpus.hexlog('keyBBKDF2', keyPBKDF2)



/**
 * example. how to get an rawBinaryKey from PBKDF2  using string Key, salt.
 * @param {*} keySrc 
 * @param {*} saltSrc 
 * @param {*} ntime 
 * @returns 
 */
function getU8RawKeyByPBKDF2 (keySrc, saltSrc, ntime) {
    return wc.importKey(
      'raw',
      sha256.hash(keySrc),  // using arrayBuffer
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    ).then(function (rawKey) {
      return wc.deriveBits(  // return arrayBuffer
        {
          name: 'PBKDF2',
          salt: otpus.sha256.hash(saltSrc).slice(0, 16),
          iterations: ntime,
          hash: 'SHA-256'
        },
        rawKey,
        256
      )
    }).then( arrayBuffer => {
      return new Uint8Array(arrayBuffer)  // return Uint8
    })
  }

  
