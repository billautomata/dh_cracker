var crypto = require('crypto')
var bignum = require('bignum')
var cracker = require('./cracker.js')

var nbits = 24

var alice = crypto.createDiffieHellman(nbits)
var bob = crypto.createDiffieHellman(nbits)

alice.generateKeys()
bob.generateKeys()

console.log('alice keys')
console.log('--------------')
expose(alice)
console.log()

console.log('bob keys')
console.log('--------------')
expose(bob)
console.log()

var shared_secret = alice.computeSecret(bob.getPublicKey())

console.log('shared secret\t', bignum.fromBuffer(shared_secret).toString())

// create an aes256 cipher object
var cipher = crypto.createCipher('aes256', alice.getPrime())

// add the data to the cipher
cipher.update('bill')

var encrypted_buffer = cipher.final()
console.log('encrypted data\t',bignum.fromBuffer(encrypted_buffer).toString())

var crack_alice = cracker({
  generator: bignum.fromBuffer(alice.getGenerator()),
  prime: bignum.fromBuffer(alice.getPrime()),
  publickey: bignum.fromBuffer(alice.getPublicKey())
})

crack_alice.start()

// utility functions
function expose(alice){
  console.log('generator\t', bignum.fromBuffer(alice.getGenerator()).toString())
  console.log('p\t\t', bignum.fromBuffer(alice.getPrime()).toString())
  console.log('publickey\t', bignum.fromBuffer(alice.getPublicKey()).toString())
  console.log('privatekey\t', bignum.fromBuffer(alice.getPrivateKey()).toString())
}
