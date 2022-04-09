import assert from 'assert/strict';
import { RAND, encryptMessage, decryptMessage } from '../src/otpus.js'


describe('encryptMessage', function () {

    describe('accept string data. ', function () {
        const strKey = 'string key'

        it('should throw error for binary data.', function () {
            assert.throws(
              () => encryptMessage(Buffer.from('use raw string data') , strKey ),
                 new TypeError('msg: Use string message.')
            );
          });

    });  



    describe('accept string key. ', function () {
        const strData = 'string data'
        const strKey = 'string key'
        it('success enc. dec.', function () {
            const result = decryptMessage( encryptMessage(strData, strKey) , strKey )
            assert.ok( result === strData)
        });
    });
    describe('accept any size of buffer key', function () {

        it('success enc. dec.', function () {
            const strData = 'string data'
            const randSizeKey = RAND( RAND(1)[0] )
            prn('random keySize', randSizeKey.byteLength )
            const result = decryptMessage( encryptMessage(strData, randSizeKey) , randSizeKey )
            assert.ok( result === strData)
        });
    });

    describe('when normal.', function () {

        it('decryptMessage should return same.', function () {
            const key = RAND(32)
            const plainStr = 'this is plain text.'
            const encBase64 = encryptMessage(plainStr, key)
            const dec = decryptMessage(encBase64, key)

            prn('plainStr', plainStr)
            prn('dec', dec)
            assert.equal(plainStr, dec)
        });

    });

    describe('decryptMessage', function () {
        describe('when data is modified', function () {
            it('should return undefined. because dismatch HMAC.', function () {

                const key = RAND(32)
                const plainStr = 'this is plain text.'
                const encBase64 = encryptMessage(plainStr, key)
                //modify encData
                const cropData = Buffer.from(encBase64, 'base64')
                cropData[10] ^= 0x01;  //1bit change.
                const cropBase64 = cropData.toString('base64')
                const dec = decryptMessage(cropBase64, key)
                prn('crop data dec', dec)
                assert.ok(dec === undefined)
            });
        });

    });

});



function prn(tag, v) {
    console.log(tag, v)
}
function prnObj(tag, v) {
    v = JSON.stringify(v, null, 2)
    console.log(tag, v)
}

function hex(title, data) {
    console.log(title, MBP.hex(data));
}
