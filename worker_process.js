var cracker
process.on('message', function(msg){
  //console.log('worker got message', msg)
  if(msg.name === 'crack_data'){
    cracker = require('./cracker.js')(msg)
    cracker.success(function(key, worker_id, time){
      console.log('sending success message', key)
      process.send({
        id: worker_id,
        name: 'cracked',
        key: key,
        time: time
      })
    })

    cracker.report(function(worker_id,current_crack_index){
      // console.log([worker_id, current_crack_index].join('\t'))
    })

    cracker.begin()

  } else if(msg.name === 'stop'){
    // console.log('worker ending cracker')
    cracker.end()
  } else {
    console.log('message not understood')
  }
})

process.on('error', function(e){
  console.log('process error!', e)
})
