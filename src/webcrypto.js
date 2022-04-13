import { RAND, MBP, webCrypto } from './otpus.js'
const wc = webCrypto.subtle

/* otpus encryption lib.  Using WebCrypto API  */

/**
 * General purpose encryption.
 * 
 * features:
 * - support encryption for any type of data using string(or any types) passPhrase.
 * - decryption result data will be same data type of origin data.
 * - randomize data size. (to hide real message size)
 * 
 * - encryption algorithm:  AES-GCM  of Webcrypto API.
 * - key generation:  PBKDF2 of WebCrypto API.
 * - salt, iv:  from getRandomValues
 * - data packaging:  MBP(meta-buffer-pack)  https://github.com/make-robot/meta-buffer-pack
 * 
 * @param {String | Uint8Array | any } data 
 * @param {String | Uint8Array | any} passPhrase 
 * @param {Number} iterations default 10000. for PBKDF2
 * @returns {Promise} (will return bufferPack when fulfilled)  bufferPack is Buffer( subclass of Uint8Array)
 * 
 */
export async function encrypt(data, passPhrase, iterations = 10000) {

    const randSize = parseInt(RAND(1)[0] / 4);  // 0~63
    const randBuffer = RAND(randSize)

    // To hide real data size   ( special feature of otpus.)
    // [ random size of buffer with random values + real data buffer ]
    const randomSizeDataPack = MBP.pack(
        MBP.MB('#randBuffer', randBuffer),
        MBP.MB('realData', data)
    )

    const salt = RAND(16)  // at least 16Bytes  https://developer.mozilla.org/en-US/docs/Web/API/Pbkdf2Params
    const iv = RAND(12) // recommended 12Bytes https://developer.mozilla.org/en-US/docs/Web/API/AesGcmParams
    // otpus.RAND(size) is shortcut of getRandomValues( new Uint8Array(size) )


    const rawKey = await wc.importKey(
        "raw",
        MBP.U8(passPhrase),
        // MBP.U8() return Uint8Array for any data types.  ex. string -> return encoded(UTF8)     
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    const key = await wc.deriveKey(
        {
            "name": "PBKDF2",
            salt: salt,
            "iterations": iterations,
            "hash": "SHA-256"
        },
        rawKey,
        { "name": "AES-GCM", "length": 256 },
        true,
        ["encrypt", "decrypt"]
    );

    const encData = await wc.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        key,
        randomSizeDataPack
    );

    return MBP.pack(
        MBP.MB('encData', encData),
        MBP.MB('iv', iv),
        MBP.MB('salt', salt),
        MBP.MB('iterations', iterations)
    )

}



/**
 * 
 * @param {Uint8Array} encPack bufferPack (MBP pack) 
 * @param {String | Uint8Array | any } passPhrase 
 * @returns {Promise} will return decodedData when fulfilled
 * 
 * [important] 
 * return data type of decodedData is same with encryption data. (MBP pack feature. )
   case 1. encrypt( data:String, key)      => pack =>  decrypt(pack, key) : Promise => String.
   case 1. encrypt( data:Number, key)      => pack =>  decrypt(pack, key) : Promise => Number.
   case 2. encrypt( data:Uint8Array, key)  => pack =>  decrypt(pack, key) : Promise => Uint8Array.
 */
export async function decrypt(encPack, passPhrase) {

    const pack = MBP.unpack(encPack)
    const rawKey = await wc.importKey(
        "raw",
        MBP.U8(passPhrase),
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    const key = await wc.deriveKey(
        {
            "name": "PBKDF2",
            salt: pack.salt,
            "iterations": pack.iterations,
            "hash": "SHA-256"
        },
        rawKey,
        { "name": "AES-GCM", "length": 256 },
        true,
        ["encrypt", "decrypt"]
    );

    const randomSizeDataPack = await wc.decrypt(
        {
            name: "AES-GCM",
            iv: pack.iv
        },
        key,
        pack.encData
    );

    const innerPack = MBP.unpack(randomSizeDataPack)


    return innerPack.realData
}

