import { encrypt, decrypt ,Buffer } from "../src/index.js";

// const wc = webCrypto.subtle

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


// promise chain

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
