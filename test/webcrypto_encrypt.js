import assert from 'assert/strict'
import {  encrypt, decrypt } from '../src/index.js'

describe('encrypt', function () {
  describe('decryption result is:', function () {

    it('equal for string data.', function () {
        const key = 'passphrase'
        const originData = 'hello otpus!'
        encrypt(originData, key)
          .then(secretPack => {
            return decrypt(secretPack, key)
          })
          .then(data => {
            assert.equal(  data,  originData )
          })

    })
    it('equal for Uint8Array data.', function () {
        const key = 'passphrase'
        const originData = Uint8Array.from([1,2,3,4])
        encrypt(originData, key)
          .then(secretPack => {
            return decrypt(secretPack, key)
          })
          .then(data => {
            assert.equal(  data,  originData )
          })

    })

    it('equal for Number data.', function () {
        const key = 'passphrase'
        const originData = 12345678
        encrypt(originData, key)
          .then(secretPack => {
            return decrypt(secretPack, key)
          })
          .then(data => {
            assert.equal(  data,  originData )
          })

    })

    it('equal for Array data.', function () {
        const key = 'passphrase'
        const originData = [1,2,3,4,5]
        encrypt(originData, key)
          .then(secretPack => {
            return decrypt(secretPack, key)
          })
          .then(data => {
            assert.equal(  data,  originData )
          })

    })



  })

  describe('decryption result data type is.', function () {


    it('same data type for string data.', function () {
        const key = 'passphrase'
        const originData = 'hello otpus!'
        encrypt(originData, key)
          .then(secretPack => {
            return decrypt(secretPack, key)
          })
          .then(data => {
            assert.equal(  typeof data,  typeof originData )
          })

    })
    it('same data type  for Uint8Array data.', function () {
        const key = 'passphrase'
        const originData = Uint8Array.from([1,2,3,4])
        encrypt(originData, key)
          .then(secretPack => {
            return decrypt(secretPack, key)
          })
          .then(data => {
            assert.ok(  data instanceof Uint8Array  )
          })

    })

    it('same data type  for Number data.', function () {
        const key = 'passphrase'
        const originData = 12345678
        encrypt(originData, key)
          .then(secretPack => {
            return decrypt(secretPack, key)
          })
          .then(data => {
            assert.equal(  typeof data,  'number' )
          })

    })

    it('same data type  for Array data.', function () {
        const key = 'passphrase'
        const originData = [1,2,3,4,5]
        encrypt(originData, key)
          .then(secretPack => {
            return decrypt(secretPack, key)
          })
          .then(data => {
            assert.ok(  Array.isArray( originData ) )
          })

    })


  })

})
