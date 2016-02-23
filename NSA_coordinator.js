var app = require('express')()
var bignum = require('bignum')
var bodyparser = require('body-parser')
var crypto = require('crypto')
var http = require('http')
var request = require('request')

var UUID = crypto.randomBytes(12).toString('hex')
var NSA_CRACKER_IP = 'localhost'
var NSA_CRACKER_PORT = 3000
var NSA_COORDINATOR_IP = 'localhost'
var NSA_COORDINATOR_PORT = 3001

// setup server to parse json
app.use(bodyparser.json())

app.get('/crack/:bit_depth', function(req,res){
  var alice = crypto.createDiffieHellman(Number(req.params.bit_depth))
  alice.generateKeys()

  console.log('trying to find', bignum.fromBuffer(alice.getPrivateKey()).toString())

  // save key to database

  var begin_index = bignum(0)
  // var end_index = bignum(1).shiftLeft(bignum.fromBuffer(alice.getPublicKey()).bitLength())
  var end_index = bignum(1).shiftLeft(Number(req.params.bit_depth))

  var url = 'http://' + NSA_CRACKER_IP + ':' + NSA_CRACKER_PORT + '/blocks/'
  url += bignum.fromBuffer(alice.getGenerator()).toString() + '/'
  url += bignum.fromBuffer(alice.getPrime()).toString() + '/'
  url += bignum.fromBuffer(alice.getPublicKey()).toString() + '/'
  url += begin_index.toString() + '/'
  url += end_index.toString()

  request({
    url: url,
    method: 'GET'
  }, function(err, response, body){
    if(err){
      // retry later
    } else {
      // send the status information to register for block processing
      console.log(body)
    }
  })

  res.status(200).json({status:'ok'})

})

// setup routes
app.get('/health_check', function(req,res){
  res.status(200).json({status: 'ok', uuid: UUID})
})

// start the server
app.listen(NSA_COORDINATOR_PORT, function(){
  console.log('coordinator is booted up -- ' + UUID)
})
