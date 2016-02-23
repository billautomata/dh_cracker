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
cracker.success(function(publickey, privatekey, id, seconds){
  console.log(['success!', privatekey, id, seconds].join('\t'))
  post_success(publickey, privatekey)
  get_another_job()
})
cracker.fail(function(id, pubkey, seconds){
  console.log(['fail', id, pubkey, seconds].join('\t'))
  post_fail(id)
  get_another_job()
})

function post_success(pubkey, privatekey){
  request({
    url: String('http://' + NSA_COORDINATOR_IP + ':' + NSA_COORDINATOR_PORT + '/success/' + pubkey + '/' + privatekey),
    method: 'GET'
  }, function(err, response, body){
    if(err){
      console.log('error posting success')
    } else {
      console.log('success posted!')
    }
  })
}

function post_fail(jobid){
  request({
    url: String('http://' + NSA_COORDINATOR_IP + ':' + NSA_COORDINATOR_PORT + '/fail/' + jobid),
    method: 'GET'
  }, function(err, response, body){
    if(err){
      console.log('error posting fail')
    } else {
      console.log('fail posted!')
    }
  })
}

function get_another_job(){
  console.log('requesting another job')
  request({
    url: String('http://' + NSA_COORDINATOR_IP + ':' + NSA_COORDINATOR_PORT + '/job'),
    method: 'GET'
  }, function(err, response, body){
    if(err){
      // retry later
    } else {
      // send the status information to register for block processing
      body = JSON.parse(body)
      if(body.begin_index !== undefined){
        cracker.update({
          _id: body._id,
          begin_index: body.begin_index,
          end_index: body.end_index,
          generator: body.generator,
          prime: body.prime,
          publickey: body.publickey,
        })
        cracker.begin()
      } else {
        console.log('no more jobs')
      }
    }
  })
}

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

app.get('/newjob', function(req,res){
  get_another_job()
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
