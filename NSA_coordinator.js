var express = require('express')
var bignum = require('bignum')
var bodyparser = require('body-parser')
var crypto = require('crypto')
var http = require('http')
var request = require('request')
var mongojs = require('mongojs')

var db = mongojs('dh_cracker', ['jobs', 'keys'])

var UUID = crypto.randomBytes(12).toString('hex')
var NSA_COORDINATOR_IP = require('./determine_ip.js')()
var NSA_COORDINATOR_PORT = 3001

var current_workers = []
var workers_polling = setInterval(function(){
  current_workers.forEach(function(worker){
    var url = 'http://' + worker.ip + ':' + worker.port + '/health_check'

    request({
      url: url,
      method: 'GET'
    }, function(err, response, body){
      if(err){
        // retry later
        console.log(err)
        console.log('killing worker', worker)
        worker.kill = true
      } else {
        // send the status information to register for block processing
        body = JSON.parse(body)

        // update status
        current_workers.forEach(function(worker){
          if(body.uuid === worker.uuid){
            worker.status = body.status
          }
        })
        console.log(body)
      }
    })
  })
  // remove dead workers
  var n = current_workers.length
  current_workers = current_workers.filter(function(w){return (w.kill===undefined)})
  if(current_workers.length < n){
    console.log('removed workers ', n-current_workers.length)
  }
},1000)

var app = express()

// setup server to parse json
app.use(bodyparser.json())

app.get('/crack/:bit_depth', function(req,res){

  var alice = crypto.createDiffieHellman(Number(req.params.bit_depth))
  alice.generateKeys()

  console.log('trying to find', bignum.fromBuffer(alice.getPrivateKey()).toString())

  db.keys.save({
    generator: bignum.fromBuffer(alice.getGenerator()).toString(),
    prime: bignum.fromBuffer(alice.getPrime()).toString(),
    publickey: bignum.fromBuffer(alice.getPublicKey()).toString(),
    privatekey: 'none'
  })

  var begin_index = bignum(0)
  var end_index = bignum(1).shiftLeft(Number(req.params.bit_depth))
  var search_space_size = end_index.sub(begin_index)

  var crack_limit = 1024 * 102
  var crack_jobs = search_space_size.div(crack_limit).toNumber()
  var crack_job_size = search_space_size.div(crack_jobs)

  console.log('search space size', end_index.sub(begin_index).toString())
  console.log('jobs created', crack_jobs)

  var hash = crypto.createHash('sha256')
  hash.update(alice.getPublicKey('hex'))
  var hash_of_pubkey = hash.digest('base64')

  var jobs = []
  for(var i = 0; i < crack_jobs; i++){
    jobs.push({
      generator: bignum.fromBuffer(alice.getGenerator()).toString(),
      prime: bignum.fromBuffer(alice.getPrime()).toString(),
      publickey: bignum.fromBuffer(alice.getPublicKey()).toString(),
      begin_index: begin_index.add(crack_job_size.mul(i)).toString(),
      end_index: begin_index.add(crack_job_size.mul(i+1)).toString(),
      started: Number(0),
      finished: Number(0)
    })
  }

  console.log(jobs)
  jobs.forEach(function(job){
    db.jobs.save(job)
  })

  // var url = 'http://' + NSA_CRACKER_IP + ':' + NSA_CRACKER_PORT + '/blocks/'
  // url += bignum.fromBuffer(alice.getGenerator()).toString() + '/'
  // url += bignum.fromBuffer(alice.getPrime()).toString() + '/'
  // url += bignum.fromBuffer(alice.getPublicKey()).toString() + '/'
  // url += begin_index.toString() + '/'
  // url += end_index.toString()

  current_workers.forEach(function(worker){
    console.log(worker)
    if(worker.status === 'idle'){
      var url = 'http://' + worker.ip + ':' + worker.port + '/newjob'

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
    }
  })
  res.status(200).json({status:'ok'})
})

// setup routes
app.get('/health_check', function(req,res){
  res.status(200).json({status: 'ok', uuid: UUID})
})

app.get('/job', function(req,res){
  console.log('job requested')
  db.jobs.findOne({ started: 0 }, function(err,doc){
    if(err){
      console.log('error finding single job')
      console.log(err)
    } else {
      if(doc !== null){
      console.log('mongodoc')
        console.log(doc)
        db.jobs.findAndModify({
          query:{_id: doc._id},
          update:{ $set: { started: Date.now().valueOf() }}},
          function(err,d){
            res.status(200).json(doc)
          }
        )
      } else {
        res.status(200).json({ stop: 'true'})
      }
    }
  })
})

app.get('/success/:pub/:private', function(req,res){
  console.log('success called')
  console.log(req.params)
  db.keys.findAndModify({
    query: { publickey: req.params.pub },
    update: { $set: {privatekey: req.params.private }}},
    function(err,d){
      if(err){
        console.log('error updating existing publickey')
      } else {
        // flushing jobs for publickey
        db.jobs.remove({
          publickey: req.params.pub
        })
      }
      res.status(200).json({status:'ok'})
    }
  )
})

app.get('/fail/:jobid', function(req, res){
  db.jobs.findAndModify({
    query: { _id: req.params.jobid },
    update: { $set: { finished: 1 }}},
    function(err,d){
      if(err){
        console.log('error updating job to be finished')
      } else {
        console.log('success updating job as finished')
      }
      res.status(200).json({status:'ok'})
    }
  )
})

app.get('/register/:ip/:port/:uuid', function(req,res){

  console.log('got registration')

  var worker = {
    ip: req.params.ip,
    port: req.params.port,
    uuid: req.params.uuid
  }
  console.log(worker)
  current_workers.push(worker)

  res.status(200).json({status:'ok'})
})

app.use(express.static('public'))

// start the server
app.listen(NSA_COORDINATOR_PORT, function(){
  console.log('coordinator is booted up -- ' + UUID)
})
