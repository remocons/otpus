// import { sha256 } from './otpus-sha256.js'
// import { MBP, Buffer } from 'meta-buffer-pack'
// import base64js from 'base64-js'
// import { webcrypto } from 'crypto'

import { sha256, base64js, MBP, Buffer, webCrypto, webCryptoTest, printHashPerformance, getHashSpeed } from './otpus-util.js'
export { sha256, base64js, MBP, Buffer, webCrypto, webCryptoTest, printHashPerformance }

const encoder = new TextEncoder()
const decoder = new TextDecoder()

// export let webCrypto;

// let isNode = false
// try {
//     isNode = Object.prototype.toString.call(global.process) === '[object process]'
// } catch (e) { }

// try {
//     if (isNode) {
//         console.log('# node.js env:')  
//         webCrypto = webcrypto;
//         webCryptoTest();
//     } else if (typeof importScripts === 'function') {
//         webCrypto = self.crypto
//         console.log('# Web Worker env')
//         webCryptoTest();
//     } else if (typeof document !== 'undefined') {
//         webCrypto = window.crypto
//         console.log('# browser env')
//         webCryptoTest();
//     }

// } catch (error) {
//     console.log('webCrypto err: ', error)
// }



export function xotp(data, otpKey32Bytes, otpStartIndex = 0, shareDataBuffer = false) {

    if (!(otpKey32Bytes instanceof Uint8Array && otpKey32Bytes.byteLength === 32)) {
        console.log('wrong type of otpKey32Bytes:', otpKey32Bytes)
        throw new TypeError('xotp: Use 32 byteLength Uint8Array key.')
    }

    if (!(data instanceof Uint8Array)) {
        throw new TypeError('xotp:  Use Uint8Array data. ')
    }

    // otpKey is 36bytes  
    // 32Bytes otpKey32Bytes + 4byte Uint32 Counter( LittleEndian ). (like Uint32Array(value ) )
    const otpKey = MBP.U8pack(otpKey32Bytes, MBP.NB('32L', otpStartIndex))
    // console.log('otpKey', MBP.hex(otpKey))

    // data
    data = MBP.U8(data, shareDataBuffer)
    const otpMasterKeyArr = new Uint32Array(otpKey.buffer)

    const nBytes = data.byteLength
    const nTimes = Math.ceil(nBytes / 32) // 최소값 1   ; 필요한 otp 개수
    const lastTime = nTimes - 1 // 최소값 0
    const nRemains = nBytes % 32
    const buf32Len = Math.floor(nBytes / 4) // byteLength / 4 => 4바이트의 배수
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

/*
    문자열을 UTF8호환 TextEncoder로 encode 하여 버퍼로 변환후 암호화한뒤 base64 문자열로 반환한다.
    특징 및 제한
    1. randomize size.  : 매 암호화시마다 암호결과값의 크기가 달라진다.(현재 0~64 랜덤추가됨)   메시지폭 검사 대항.
    2. control strength of key:  중첩해쉬를 통한 암호키 생성방식으로 강도 조절.
                                2 ^ n 번 중첩연산됨. n은 10~16 충분. 너무크면 시간이 오래걸리므로 주의.
                                현재, 16까지만 되도록 제한걸어둠.

    3. 메시지 크기는 2 ^ 16 까지만 되도록 제한함. 문자열이라 64KB정도로 제한함.

    암호화 결과 데이타 버퍼 구조.
    +---------+-------+----------+
    데이타명:   index   bytesize.
    msg:        [0]     1 ~ 64KB
    hmac:       [-67]   32 Bytes
    salt:       [-35]   32 Bytes
    nPower:     [-3]    1 Bytes
    msgLen:     [-2]    2 Bytes
*/

const msgPos = { msg: 0, hmac: -67, salt: -35, nPower: -3, msgLen: -2 }

// key , msg  : string
// output  base64 : string
// save, transport  string

export function encryptMsg(msg, key, nPower = 10) {
    const msgBuffer = encoder.encode(msg)
    const realMsgLen = msgBuffer.byteLength
    const saltBin = webCrypto.getRandomValues(new Uint8Array(32))
    // var saltBin = new Uint8Array(32) ;
    const randomSize = realMsgLen + parseInt(webCrypto.getRandomValues(new Uint8Array(1))[0] / 4) // 0~63.
    // var randomSize = 4;
    if (randomSize > 65536) {
        console.log('over msg size limit: it support about 64KB ascii characters.  or about 20K  UTF-8 characters ')
        return ''
    }
    if (nPower > 20) {
        console.log('over ntimeKey limit: 16 max.')
        return ''
    }
    // 다른형식의 데이타나 손상된 메시지 체크도 필요함.  이값이 너무 커지면 멈춤.
    // 현재는 특정사이트용 간단한 구현.  공개lib형의 경우 추가로 메시지 체크섬,  메시지 시간, 규칙, 에러핸들링 추가요함.

    const msgBufferExpanded = new Uint8Array(randomSize)
    msgBufferExpanded.set(msgBuffer)
    const saltStr = buf2hex(saltBin.buffer)
    const masterKeyArr = nTimesHash(saltStr + key, Math.pow(2, nPower))

    const hmac = sha256.hmac(masterKeyArr, msgBuffer)

    xotp(msgBufferExpanded, masterKeyArr, 0)
    const base64Buffer = new Uint8Array(msgBufferExpanded.byteLength + hmac.byteLength + saltBin.byteLength + 3)
    base64Buffer.set(msgBufferExpanded)

    base64Buffer.set(hmac, base64Buffer.byteLength + msgPos.hmac)
    base64Buffer.set(saltBin, base64Buffer.byteLength + msgPos.salt)
    base64Buffer[base64Buffer.byteLength + msgPos.nPower] = nPower
    const dv = new DataView(base64Buffer.buffer)
    dv.setUint16(base64Buffer.byteLength + msgPos.msgLen, msgBufferExpanded.byteLength)
    return base64js.fromByteArray(base64Buffer)
}

export function encryptMsgPack(msg, key, nPower = 10) {

    const msgBuffer = MBP.U8(msg)
    const realMsgLen = msgBuffer.byteLength
    const saltBin = webCrypto.getRandomValues(new Uint8Array(32))

    const randomSize = realMsgLen + parseInt(webCrypto.getRandomValues(new Uint8Array(1))[0] / 4) // 0~63.
    // var randomSize = 4;


    const msgBufferExpanded = new Uint8Array(randomSize)
    msgBufferExpanded.set(msgBuffer)
    const saltStr = buf2hex(saltBin)

    const masterKeyArr = nTimesHash(saltStr + key, Math.pow(2, nPower))

    const hmac = sha256.hmac(masterKeyArr, msgBuffer)

    // hexlog('mkey', masterKeyArr)
    // hexlog('mbe', msgBufferExpanded)

    let encBuffer = xotp(msgBufferExpanded, masterKeyArr, 0)
    // hexlog('mbe', encBuffer)

    const pack = MBP.pack(
        MBP.MB('msgBuffer', encBuffer),
        MBP.MB('hmac', hmac),
        MBP.MB('salt', saltBin),
        MBP.MB('nPower', '8', nPower),
        MBP.MB('msgLen', '16', msgBuffer.byteLength)
    )
    // console.log( pack )
    return pack.toString('base64')
}

export function decryptMsgPack(b64msg, key) {
    const msgObj = MBP.unpack(Buffer.from(b64msg, 'base64'))

    // console.log( 'msgObj', msgObj)

    if (msgObj.nPower > 20) {
        console.log('warning: too much nPower:' + msgObj.nPower)
        return 'nPower too large'
    }
    const saltStr = buf2hex(msgObj.salt)
    const masterKeyArr = nTimesHash(saltStr + key, Math.pow(2, msgObj.nPower))

    const decodedMsgBuffer = xotp(msgObj.msgBuffer, masterKeyArr, 0)

    const realMsgBuffer = decodedMsgBuffer.slice(0, msgObj.msgLen)

    const hmac = sha256.hmac(masterKeyArr, realMsgBuffer)

    if (!equal(hmac, msgObj.hmac)) return 'BROKEN'
    const msg = decoder.decode(realMsgBuffer)

    return msg
}

export function decryptMsg(b64msg, key) {
    const totalBuffer = base64js.toByteArray(b64msg)
    const dv = new DataView(totalBuffer.buffer)
    const msgLen = dv.getUint16(totalBuffer.byteLength + msgPos.msgLen)
    const expandedMsgBuffer = totalBuffer.slice(0, msgLen)
    const saltBin = totalBuffer.slice(msgPos.salt, msgPos.nPower)
    const hmacRead = totalBuffer.slice(msgPos.hmac, msgPos.salt)

    const nPower = dv.getUint8(totalBuffer.byteLength + msgPos.nPower)
    if (nPower > 20) {
        console.log('warning: too much nPower:' + nPower)
        return 'nPower 값이 너무큰것같음'
    }
    const saltStr = buf2hex(saltBin.buffer)
    const masterKeyArr = nTimesHash(saltStr + key, Math.pow(2, nPower))
    xotp(expandedMsgBuffer, masterKeyArr, 0)
    const realMsgBuffer = expandedMsgBuffer.slice(0, expandedMsgBuffer.indexOf(0))

    const hmac = sha256.hmac(masterKeyArr, realMsgBuffer)

    if (!equal(hmac, hmacRead)) return 'BROKEN'
    const msg = decoder.decode(realMsgBuffer)

    return msg
}

export function buf2hex(buffer) { return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('') } // arraybuffer를 hex문자열로

export function equal(buf1, buf2) {
    if (buf1.byteLength !== buf2.byteLength) return false
    for (let i = 0; i < buf1.byteLength; i++) {
        if (buf1[i] !== buf2[i]) return false
    }
    return true
}

/* nTimesHash.   (PBKDF2 와 유사한 용도)
최초  srcData로 arrayBuffer화 1회 연ㅏ 후  n회 반복.  총 hash 연산수는 n+1번임.
입력: srcData:  참고로 문자열, UTF-8문자열 입력시 인코딩됨, array, typedarray, arraybuffer 모두 지원
출력: Uint8Array 반환
*/

export function nTimesHash(srcData, n) {
    let hashSum = sha256.hash(srcData)
    for (let i = 0; i < n; i++) hashSum = sha256.hash(hashSum)
    return hashSum
}


export const HASH_POWER = getHashSpeed(10000)


function hexlog(name, data) {

    console.log(name, MBP.hex(data))
}