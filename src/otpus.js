import { sha256, base64js, MBP, Buffer, webCrypto, webCryptoTest, printHashPerformance, getHashSpeed } from './otpus-util.js'
export { sha256, base64js, MBP, Buffer, webCrypto, webCryptoTest, printHashPerformance }

const encoder = new TextEncoder()
const decoder = new TextDecoder()

export function RAND(size) {
    return webCrypto.getRandomValues(Buffer.alloc(size))
}

/**
 * XOR encryption ( same with decryption)
 * 1. generate OTP from SHA
 * 2. XOR data and OTP
 *
 * @param {Uint8Array} data
 * @param {Uint8Array} otpKey32Bytes
 * @param {Number} otpStartIndex
 * @param {boolean} shareDataBuffer  true: modify origin data,  false: return new data.
 * @returns encryptedData
 */
export function xotp(data, otpKey32Bytes, otpStartIndex = 0, shareDataBuffer = false) {
    if (!(otpKey32Bytes instanceof Uint8Array) || !(otpKey32Bytes.byteLength === 32)) {
        throw new TypeError('xotp: Use 32 byteLength Uint8Array key.')
    }

    if (!(data instanceof Uint8Array)) {
        throw new TypeError('xotp:  Use Uint8Array data. ')
    }

    if (typeof otpStartIndex !== 'number') {
        throw new TypeError('otpStartIndex:  Use Number. 0 ~  2 ** 32 - 1')
    }

    if (typeof shareDataBuffer !== 'boolean') {
        throw new TypeError('sharedDataBuffer: Use boolean. true or false.')
    }
    // otpKey is 36bytes
    // 32Bytes otpKey32Bytes + 4byte Uint32 Counter( LittleEndian ). (like Uint32Array(value ) )
    const otpKey = MBP.U8pack(otpKey32Bytes, MBP.NB('32L', otpStartIndex))
    // console.log('otpKey', MBP.hex(otpKey))

    // data
    data = MBP.U8(data, shareDataBuffer)
    const otpMasterKeyArr = new Uint32Array(otpKey.buffer)

    const nBytes = data.byteLength
    const nTimes = Math.ceil(nBytes / 32) // min. 1   ; needed number of otp
    const lastTime = nTimes - 1 // min. 0
    const nRemains = nBytes % 32
    const buf32Len = Math.floor(nBytes / 4) // byteLength / 4 =>  multiple of 4.
    // console.log(`bayoXCrypto src u8Arr .byteOffset: ${u8Arr.byteOffset} .byteLength: ${u8Arr.byteLength}  1/4 floored => buf32Len: ${buf32Len}`);

    const buf32 = new Uint32Array(data.buffer, data.byteOffset, buf32Len)

    for (let i = 0; i < nTimes; i++) {
        // 32바이트 단위로 원본 파일읽어서 otp 연산.
        // 1. indexed otp 생성
        otpMasterKeyArr[8]++

        const potp = sha256.hash(otpMasterKeyArr.buffer)
        const potp32 = new Uint32Array(potp.buffer)

        // console.log('potp', potp)
        // console.log('potp32', potp32)
        if (i === lastTime && nRemains !== 0) { // 32바이트 이하 (나머지 Byte 연산)
            const potp8 = potp
            for (let q = nBytes - nRemains, r = 0; r < nRemains; r++) { // 최대 31번
                // console.log(`q:${q} r:${r}`);
                data[q++] ^= potp8[r] // q;버퍼의 index   r; otp의 index
            }
        } else { // 4Bytes 단위 8회 연산
            for (let ib = 0; ib < 8; ib++) buf32[i * 8 + ib] ^= potp32[ib]
        }
    }

    return data
}

/**
 * text message encryption.
 *
 * @param {String} msg plainText
 * @param {String} key passPhrase
 * @param {Number} nPower keyAging factor for nTimesHash().  default 10 => 2 ** 10 => repeat hash 1024 times.
 * @returns
 */
export function encryptMessage(msg, key, nPower = 10) {
    if (typeof msg !== 'string') {
        throw new TypeError('msg: Use string message.')
    }
    const msgBuffer = MBP.U8(msg)
    const salt = RAND(32)
    const saltStr = buf2hex(salt)
    const mainKey = nTimesHash(saltStr + key, 2 ** nPower)
    const randSize = parseInt(RAND(1)[0] / 4) // random number range  0~63
    const randBuffer = RAND(randSize)

    const randomSizeMessage = MBP.pack(
        MBP.MB('#rand', randBuffer),
        MBP.MB('msg', msgBuffer)
    )

    const hmac = sha256.hmac(mainKey, randomSizeMessage)

    const encMsg = xotp(randomSizeMessage, mainKey)

    const pack = MBP.pack(
        MBP.MB('encMsg', encMsg),
        MBP.MB('hmac', hmac),
        MBP.MB('salt', salt),
        MBP.MB('nPower', '8', nPower)
    )

    return pack.toString('base64')
}

// return string if success.
// return undefined if fail.
export function decryptMessage(b64msg, key) {
    const msgObj = MBP.unpack(Buffer.from(b64msg, 'base64'))
    // console.log( 'msgObj', msgObj)

    if (msgObj.nPower > 20) {
        console.log('warning: too much nPower:' + msgObj.nPower)
        return 'nPower too large'
    }
    const saltStr = buf2hex(msgObj.salt)
    const mainKey = nTimesHash(saltStr + key, 2 ** msgObj.nPower)

    const decMsg = xotp(msgObj.encMsg, mainKey, 0)
    const hmac = sha256.hmac(mainKey, decMsg)

    try {
        const pack = MBP.unpack(decMsg)
        if (typeof pack === 'object') {
            // console.log( pack )
            if (!equal(hmac, msgObj.hmac)) return // 'Wrong HMAC: BROKEN'
            const msg = decoder.decode(pack.msg)
            return msg
        }
    } catch (error) {
    }
}

export function buf2hex(buffer) { return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('') } // arraybuffer를 hex문자열로

export function equal(buf1, buf2) {
    if (buf1.byteLength !== buf2.byteLength) return false
    for (let i = 0; i < buf1.byteLength; i++) {
        if (buf1[i] !== buf2[i]) return false
    }
    return true
}

/**
 * ( simplified PBKDF2 )
 * @param {String | Uint8Array } srcData  *input: key + salt(rand) together. (support string.)
 * @param {Number} n how much repeat hash
 * @returns hash32bytes : Uint8Array
 */
export function nTimesHash(srcData, n) {
    let hashSum = sha256.hash(srcData)
    for (let i = 0; i < n; i++) hashSum = sha256.hash(hashSum)
    return hashSum
}

export const HASH_POWER = getHashSpeed(10000)

export function hexlog(name, data) {
    console.log(name, MBP.hex(data))
}

