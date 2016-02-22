var crypto = require('crypto')
var bignum = require('bignum')
var cracker = require('./cracker.js')
const child_process = require('child_process');

var n_threads = 8
var nbits = 24

console.log('\n\n\n\n\n')

var workers = []
for (var i = 0; i < n_threads; i++) {
  workers.push(child_process.fork('./worker_process.js', []))
}

var alice = crypto.createDiffieHellman(nbits)
alice.generateKeys()
expose(alice)

for(var worker_idx in workers){
  var worker = workers[worker_idx]

  console.log('worker_idx', worker_idx)

  var bit_len = bignum.fromBuffer(alice.getPublicKey()).bitLength()
  var min_val = bignum(1).shiftLeft(nbits - 2)
  var max_val = bignum(1).shiftLeft(nbits)
  var diff = max_val.sub(min_val).div(n_threads)
  var begin_index = min_val.add(diff.mul(worker_idx))
  var end_index = min_val.add(diff.mul(worker_idx+1))

  worker.on('message', function (msg) {
    console.log('master got message', msg)
    nuke_workers(workers)
  })

  worker.on('error', function(e){
    console.log('worker error', e)
  })

  worker.send({
    id: worker_idx,
    name: 'crack_data',
    begin_index: begin_index.toString(),
    end_index: end_index.toString(),
    generator: bignum.fromBuffer(alice.getGenerator()).toString(),
    prime: bignum.fromBuffer(alice.getPrime()).toString(),
    publickey: bignum.fromBuffer(alice.getPublicKey()).toString()
  })
}

function nuke_workers(m) {
  for (var i in m) {
    var worker = m[i]
    console.log('sending kill to ', i)
    worker.send({
      cluster_id: i,
      name: 'stop'
    })
  }
}

// utility functions
function expose(alice) {
  console.log('generator\t', bignum.fromBuffer(alice.getGenerator()).toString())
  console.log('prime\t\t', bignum.fromBuffer(alice.getPrime()).toString())
  console.log('publickey\t', bignum.fromBuffer(alice.getPublicKey()).toString())
  console.log('privatekey\t', bignum.fromBuffer(alice.getPrivateKey()).toString())
  console.log()
}
