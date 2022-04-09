import { MBP } from '../src/otpus.js'
 
const str = 'abc'
const str2 = '가나다'

prn('str', MBP.hex( MBP.U8( str ) ) )
prn('str2', MBP.hex( MBP.U8( str2 ) ) )

const u16_2 = new Uint16Array(2);
const u16_3 = new Uint16Array(3);
const u32_2 = new Uint32Array(2);
const u32_3 = new Uint32Array(3);

prn('u16_2', MBP.hex( MBP.U8( u16_2 ) ) )
prn('u16_3', MBP.hex( MBP.U8( u16_3 ) ) )
prn('u32_2', MBP.hex( MBP.U8( u32_2 ) ) )
prn('u32_3', MBP.hex( MBP.U8( u32_3 ) ) )


prn('u32_3', MBP.hex( MBP.U8( Uint32Array.from([0x01020304,0xff000001,0x010000ff]) ) ) )


let u8_32 = Uint8Array.from([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15])
prn( 'u8_32', u8_32 )
prn( 'u8_32', MBP.hex(u8_32) )

let u32_8 = new Uint32Array( u8_32.buffer)

prn( 'u32_8',  u32_8.length, u32_8.byteLength, u32_8.byteOffset )
u32_8[1] = 0xff
prn( 'u32_8', MBP.hex(u32_8.buffer ) )
// prn( 'u32_8', MBP.hex(u32_8 ) )
// prn( 'u32_8[0]', MBP.hex(u32_8[0]) )
// prn( 'u32_8[3]', MBP.hex(u32_8[3]) )


function prn(...args){
    console.log(...args)
}

