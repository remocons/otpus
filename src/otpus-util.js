

import { sha256 } from './otpus-sha256.js'
import { MBP, Buffer } from 'meta-buffer-pack'
import base64js from 'base64-js'

export { sha256 , base64js , MBP, Buffer }
export let webCrypto

const encoder = new TextEncoder()
const decoder = new TextDecoder()

let isNode = false
try {
    isNode = Object.prototype.toString.call(global.process) === '[object process]'
} catch (e) { }

try {
    if (isNode) {
        console.log('# node.js env:')
        import('crypto').then(crypto => {
            console.log('otpus webcrypto:')
            webCrypto = crypto.webcrypto;
            // webCryptoTest();
        })
    } else if (typeof importScripts === 'function') {
        webCrypto = self.crypto
        console.log('# Web Worker env')
        // webCryptoTest();
    } else if (typeof document !== 'undefined') {
        webCrypto = window.crypto
        console.log('# browser env')
        // webCryptoTest();
    }

} catch (error) {
    console.log('webCrypto err: ', error)
}


export function webCryptoTest() {
    if (typeof webCrypto.subtle !== 'object') {
        console.log('No WebCrypto API supported.')
    } else {
        console.log('webCrypto test:')
        let rand = webCrypto.getRandomValues(new Uint8Array(40))
        console.log('1. getRandomValues: ', rand)

        webCrypto.subtle.digest('SHA-256', rand).then(sum => {
            let hash1 = buf2hex(sum);
            let hash2 = sha256.hex(rand);
            console.log('A.Compare binary hash sums')
            console.log('1. subtle.digest.sha256: ', hash1)
            console.log('2. js.sha256: ', hash2)
            if (hash1 === hash2) {
                console.log('hash test: success.')
            } else {
                throw new Error('diffrent hash result')
            }

        })
        let message = buf2hex(rand.buffer)

        webCrypto.subtle.digest('SHA-256', encoder.encode(message)).then(sum => {
            let hash1 = buf2hex(sum);
            let hash2 = sha256.hex(message);
            console.log('B.Compare string hash sums')
            console.log('1. subtle.digest.sha256: ', hash1)
            console.log('2. js.sha256: ', hash2)
            if (hash1 === hash2) {
                console.log('hash test: success.')
            } else {
                throw new Error('diffrent hash result')
            }

        })

    }
}



