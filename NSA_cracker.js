var app = require('express')()
var bignum = require('bignum')
var bodyparser = require('body-parser')
var crypto = require('crypto')
var http = require('http')
var request = require('request')

var cracker = require('./cracker.js')()

cracker.report(function(id, current_index){
  console.log(['progress', id, current_index].join('\t'))
})
cracker.success(function(privatekey, id, seconds){
  console.log(['success!', privatekey, id, seconds].join('\t'))
})
cracker.fail(function(id, seconds){
  console.log(['fail', id, seconds].join('\t'))
})

var UUID = crypto.randomBytes(12).toString('hex')
var NSA_CRACKER_IP = 'localhost'
var NSA_CRACKER_PORT = 3000
var NSA_COORDINATOR_IP = 'localhost'
var NSA_COORDINATOR_PORT = 3001

// setup server to parse json
app.use(bodyparser.json())

// setup routes
app.get('/health_check', function(req,res){
  res.status(200).json({status: 'ok', uuid: UUID})
})

app.get('/blocks/:g/:p/:publickey/:begin_index/:end_index', function(req, res){

  console.log('got block to process')
  console.log(req.params)

  cracker.update({
    _id: UUID,
    begin_index: req.params.begin_index,
    end_index: req.params.end_index,
    generator: req.params.g,
    prime: req.params.p,
    publickey: req.params.publickey,
  })
  cracker.begin()

  res.status(200).json({status: 'ok'})

})

// start the server
app.listen(NSA_CRACKER_PORT, function(){
  console.log('cracker is booted up -- ' + UUID)

  request({
    url: String('http://' + NSA_COORDINATOR_IP + ':' + NSA_COORDINATOR_PORT + '/health_check'),
    method: 'GET'
  }, function(err, response, body){

    if(err){
      // retry later
    } else {
      // send the status information to register for block processing
      console.log(body)
    }

  })

})
