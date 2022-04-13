import{ encrypt, decrypt, MBP } from 'otpus'

const secretPack = await encrypt('data','key')

// secretPack is Buffer ( subclass of Uint8Array)
console.log( secretPack instanceof Uint8Array ) //  true 

// If you need base64 format. ( string data) 
const base64Pack = secretPack.toString('base64')
console.log( 'base64 data:', base64Pack ) //  true 

// secretPack is meta-buffer-pack of MBP.
// You can use  MBP.unpack() to check public information like iv , salt.
const secretObject = MBP.unpack( secretPack )
console.log( 'salt:', secretObject.salt ) // 16 bytes. random values.
