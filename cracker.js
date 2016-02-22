var bignum = require('bignum')

module.exports = function(opts){

  var _t = Date.now().valueOf()
  var _id = opts.id
  var stop

  var crack_index = bignum(opts.begin_index);
  var end_index = bignum(opts.end_index)
  var privatekey;

  var key = {
    generator: bignum(opts.generator),
    prime: bignum(opts.prime),
    publickey: bignum(opts.publickey)
  }

  var success, report

  function start(){
    if(stop === true){
      // console.log('aborting cracker', _id)
      return;

    } else {
      if(key.generator.powm(crack_index, key.prime).eq(key.publickey)){

        stop = true
        privatekey = bignum(crack_index)

        if(success !== undefined){
          return success(privatekey.toString(), _id, (Date.now().valueOf()-_t)/1000)
        }

      } else {

        // not cracked, keep going
        crack_index = crack_index.add(1)
        if(crack_index.eq(end_index)){
          console.log('worker',_id,'reached limit')
          stop = true
          return
        }
        if(crack_index.mod(10000).toNumber()===0){
          // console.log('id', _id, 'status', stop)
          report(_id, crack_index.toString())
        }
        return setImmediate(start)
        // return process.nextTick(start)
      }
    }
  }

  function end(){
    if(stop === true){
      // console.log('\t\t\t\t\t\t\talready killed', _id)
      return;
    }
    // console.log('\t\t\t\t\t\t\tkilling cracker', _id)
    stop = true
  }

  function begin(){
    stop = false
    start()
  }

  return {
    begin: begin,
    end: end,
    index: function(new_index){
      crack_index = bignum(new_index)
    },
    success: function(f){
      success = f
    },
    report: function(f){
      report = f
    }
  }

}
