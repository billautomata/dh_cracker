var app = require('express')()
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

// setup routes
app.get('/health_check', function(req,res){
  res.status(200).json({status: 'ok', uuid: UUID})
})

// start the server
app.listen(NSA_COORDINATOR_PORT, function(){
  console.log('coordinator is booted up -- ' + UUID)
})
