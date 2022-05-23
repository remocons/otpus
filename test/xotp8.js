import assert from 'assert/strict'
import { xotp8, MBP, Buffer, RAND } from '../src/index.js'

describe('xotp8', function () {
  describe('data:', function () {
    describe('should throw error:', function () {
      it('when data type is not Uint8Array', function () {
        assert.throws(
          () => xotp8('not a binary data', Buffer.alloc(32)),
          new TypeError('xotp:  Use Uint8Array data. ')
        )
      })
    })
  })

  describe('key:', function () {
    describe('should throw error:', function () {
      it('when key is not Uint8Array', function () {
        const originData = Buffer.from('abcdefg')
        assert.throws(
          () => xotp8(originData, 'not a binary key'),
          new TypeError('xotp: Use 32 byteLength Uint8Array key.')
        )
      })

      it('when key byteLength is not 32bytes.', function () {
        const originData = Buffer.from('abcdefg')
        assert.throws(
          () => xotp8(originData, RAND(31)),
          new TypeError('xotp: Use 32 byteLength Uint8Array key.')
        )
      })

      it('when key byteLength is not 32bytes.', function () {
        const originData = Buffer.from('abcdefg')
        assert.throws(
          () => xotp8(originData, RAND(33)),
          new TypeError('xotp: Use 32 byteLength Uint8Array key.')
        )
      })
    })
  })

  describe('otpStartIndex:', function () {
    it('should throw error:', function () {
      assert.throws(
        () => xotp8(Buffer.from('encoded data'), Buffer.alloc(32), '2332'),
        new TypeError('otpStartIndex:  Use Number. 0 ~  2 ** 32 - 1')
      )
    })
  })

  describe('sharedDataBuffer:', function () {
    describe('should throw error:', function () {
      it('when type is not boolean', function () {
        assert.throws(
          () => xotp8(Buffer.from('encoded message is okay.'), Buffer.alloc(32), 0, 'not boolean'),
          new TypeError('sharedDataBuffer: Use boolean. true or false.')

        )
      })
    })

    describe('if sharedDataBuffer parameter is', function () {
      const keyBuffer = RAND(32) // random 32bytes key
      describe('if false(default)', function () {
        it('should return new buffer. can not modified.', function () {
          const originData = Buffer.from('this is original message.  Not shared buffer.')
          const result = xotp8(originData, keyBuffer, 0, false) // default  false
          // not equal
          assert.ok(!MBP.equal(originData, result))
        })
      })

      describe('if true', function () {
        it('should return shared buffer.', function () {
          const originData = Buffer.from('this is original message. this is shared buffer.')
          const result = xotp8(originData, keyBuffer, 0, true) // shared
          // equal originData & resultBuffer
          assert.ok(MBP.equal(originData, result))
        })
      })
    })
  })
})
