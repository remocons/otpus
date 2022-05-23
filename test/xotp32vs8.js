import assert from 'assert/strict'
import { xotp, xotp8, MBP, Buffer, RAND } from '../src/index.js'

describe('compare xotp32 and xotp8', function () {

  
  describe('when sharedBuffer false(default)', function () {
      const originData = Buffer.from('bbbbb')
      const keyBuffer = Buffer.from('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaabb') //  32bytes key

        it('should return same result', function () {
          const result32 = xotp(originData, keyBuffer, 0, false) // default  false
          const result8 = xotp8(originData, keyBuffer, 0, false) // default  false

          console.log( 'result32', MBP.hex(result32))
          console.log( 'result8', MBP.hex(result8))

          assert.ok( MBP.equal(result32, result8) )
        })

    })

  describe('when sharedBuffer true', function () {
      const data1 = Buffer.from('bbbbb')
      const data2 = Buffer.from('bbbbb')
      const keyBuffer = Buffer.from('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaabb') //  32bytes key

        it('should return same result', function () {
          xotp(data1, keyBuffer, 0, true) // default  false
          xotp8(data2, keyBuffer, 0, true) // default  false

          console.log( 'share: result1', MBP.hex(data1))
          console.log( 'share: result2', MBP.hex(data2))

          assert.ok( MBP.equal(data1, data2) )
        })

    })

  describe('when sharedBuffer true with type arraybuffer', function () {
      let buffer1 = new ArrayBuffer(300)
      let buffer2 = new ArrayBuffer(300)
      const data1 = new Uint8Array( buffer1 ) 
      const data2 = new Uint8Array( buffer2 )
      const keyBuffer = Buffer.from('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaabb') //  32bytes key

        it('should return same result', function () {
          xotp(data1, keyBuffer, 0, true) // default  false
          xotp8(data2, keyBuffer, 0, true) // default  false

          console.log( 'share: result1', MBP.hex(data1))
          console.log( 'share: result2', MBP.hex(data2))

          assert.ok( MBP.equal(data1, data2) )
        })

    })

    describe('when sharedBuffer true with type Uint8Array', function () {

      const size = 300
      const data1 = new Uint8Array( size ) 
      const data2 = new Uint8Array( size )
      const keyBuffer = Buffer.from('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaabb') //  32bytes key

        it('should return same result', function () {
          xotp(data1, keyBuffer, 0, true) // default  false
          xotp8(data2, keyBuffer, 0, true) // default  false

          console.log( 'share: result1', MBP.hex(data1))
          console.log( 'share: result2', MBP.hex(data2))

          assert.ok( MBP.equal(data1, data2) )
        })

    })


  })


