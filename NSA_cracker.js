var app = require('express')()
var bignum = require('bignum')
var bodyparser = require('body-parser')
var crypto = require('crypto')
var http = require('http')
var request = require('request')

var cracker = require('./cracker.js')()

var UUID = crypto.randomBytes(12).toString('hex')
var NSA_CRACKER_IP = require('./determine_ip.js')()
var NSA_CRACKER_PORT = Math.floor(Math.random()*10000) + 3000
var NSA_COORDINATOR_IP = 'localhost'
var NSA_COORDINATOR_PORT = 3001

cracker.report(function(id, current_index){
  console.log(['progress', id, current_index].join('\t'))
})
cracker.success(function(publickey, privatekey, id, seconds){
  console.log(['success!', privatekey, id, seconds].join('\t'))
  post_success(publickey, privatekey, get_another_job)
})
cracker.fail(function(id, pubkey, seconds){
  console.log(['fail', id, pubkey, seconds].join('\t'))
  post_fail(id, get_another_job)
})

function post_success(pubkey, privatekey, cb){

  var url = 'http://' + NSA_COORDINATOR_IP + ':' + NSA_COORDINATOR_PORT
  url += '/success/' + pubkey + '/' + privatekey

  request({
    url: url,
    method: 'GET'
  }, function(err, response, body){
    if(err){
      console.log('error posting success')
    } else {
      console.log('success posted!')
    }
    cb()
  })
}

function post_fail(jobid, cb){
  var url = 'http://' + NSA_COORDINATOR_IP + ':' + NSA_COORDINATOR_PORT
  url += '/fail/' + jobid
  request({
    url: url,
    method: 'GET'
  }, function(err, response, body){
    if(err){
      console.log('error posting fail')
    } else {
      console.log('fail posted!')
    }
    cb()
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


// setup server to parse json
app.use(bodyparser.json())

// setup routes
app.get('/health_check', function(req,res){
  console.log(cracker.status())
  res.status(200).json({status: cracker.status().status, uuid: UUID})
})

app.get('/newjob', function(req,res){
  get_another_job()
  res.status(200).json({status: 'ok', uuid: UUID})
})

// app.get('/blocks/:g/:p/:publickey/:begin_index/:end_index', function(req, res){
//
//   console.log('got block to process')
//   console.log(req.params)
//
//   cracker.update({
//     _id: UUID,
//     begin_index: req.params.begin_index,
//     end_index: req.params.end_index,
//     generator: req.params.g,
//     prime: req.params.p,
//     publickey: req.params.publickey,
//   })
//   cracker.begin()
//
//   res.status(200).json({status: 'ok'})
//
// })

// start the server
app.listen(NSA_CRACKER_PORT, function(){
  console.log('cracker is booted up -- ' + UUID)

  request({
    url: String('http://' + NSA_COORDINATOR_IP + ':' + NSA_COORDINATOR_PORT + '/register/' + NSA_CRACKER_IP + '/' + NSA_CRACKER_PORT + '/' + UUID),
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
