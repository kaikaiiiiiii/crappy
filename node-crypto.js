const fs = require('fs')
const crypto = require('crypto')

let content = fs.readFileSync(__filename)

let algo = ['md5', 'sha1', 'sha256', 'sha512', 'ripemd160', 'sha3-224', 'sha3-256', 'sha3-384', 'sha3-512', 'blake2b512', 'blake2s256', 'md5-sha1', 'sha224', 'sha384', 'sha512-224', 'sha512-256', 'sm3']

algo.forEach((algo) => {
    try {
        console.log(`${algo} \t ${crypto.createHash(algo).update(content).digest('hex')}`)
    } catch (error) {
        console.log(algo, error.message)
    }
})
