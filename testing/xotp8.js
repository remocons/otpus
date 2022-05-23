import { xotp , xotp8, MBP } from '../src/otpus.js'
import { VirtualBuffer } from 'virtual-buffer'


const size = 36
const data1 = new Uint8Array( size ) 
const data2 = new Uint8Array( size )
const keyBuffer = Buffer.from('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaabb') //  32bytes key


    xotp(data1, keyBuffer, 0, true) // default  false
    xotp8(data2, keyBuffer, 0, true) // default  false

    console.log( 'share: result1', MBP.hex(data1))
    console.log( 'share: result2', MBP.hex(data2))


    console.log( MBP.equal(data1, data2) )

