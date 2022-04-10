import * as otpus from "../src/otpus.js";

const wc = otpus.wc
const sha256 = otpus.sha256

/*
webcrypto. 

# Buffer Source.
https://webidl.spec.whatwg.org/#idl-buffer-source-types

generaly
params: ArrayBuffer ,TypedArray, DataView
return: ArrayBuffer


*/
const strKey = 'key'

const rawKey = otpus.RAND( 32 )

// AES_GCM 암호화.

//1. AES_GCM 전용 키 생성.

// getGCM_KEY ( keyBuffer )
const key_AES_GCM = await wc.importKey(
    'raw',   // 직접 생성한 버퍼로 생성가능.
    rawKey,   // Buffer Source.
    'AES-GCM',  // 암호화 방식 확정
    false,       //파생키 추출 허용여부
    ['encrypt'] //암호화 방식 확정.
    )

// 2. encrypt 수행
const inputBuffer = otpus.MBP.U8('aaaaaaaaaaaaaaaa')

// encrytGCM  (iv , data)
const output = await wc.encrypt(
    { name: 'AES-GCM',  //알고리즘 지정
    iv: otpus.RAND(12) },  // iv값. 12바이트.
    key_AES_GCM,   // 전용키
    inputBuffer)    //암호화 버퍼. 

// importKey  'raw' 

otpus.hexlog('input', inputBuffer)
otpus.hexlog('output', output)

const keyPBKDF2 = await getU8RawKeyByPBKDF2( 'key', 'salt', 1000 )

otpus.hexlog('keyBBKDF2', keyPBKDF2)


// nTimesHash 유사 기능. but  표준 PBKDF2사용 
// importKey  1차로 raw자료로 키생성후 PBKDF2 에 전달. 
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

  
