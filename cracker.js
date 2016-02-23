var bignum = require('bignum')

module.exports = function(){

  // opts: {
  //   _id: String,
  //   begin_index: bignum-string,
  //   end_index: bignum-string,
  //   generator: bignum-string,
  //   prime: bignum-string,
  //   publickey: bignum-string
  // }

  // worker state
  var stop

  var _t, _id
  var crack_index, end_index
  var privatekey

  var key = {
    generator: '',
    prime: '',
    publickey: ''
  }

  // calbacks
  var success, report, fail

  function update(opts){

    console.log('opts',opts)

    _t = Date.now().valueOf()
    _id = opts._id
    crack_index = bignum(String(opts.begin_index))
    end_index = bignum(String(opts.end_index))
    key.generator = bignum(String(opts.generator))
    key.prime = bignum(String(opts.prime))
    key.publickey = bignum(String(opts.publickey))

    console.log('key', key)

  }

  function start(){

    if(stop === true){
      // console.log('aborting cracker', _id)
      return;

    } else {

      // if the crack is successful
      if(key.generator.powm(crack_index, key.prime).eq(key.publickey)){

        stop = true // stop the processor
        privatekey = bignum(crack_index)  // assign the private key

        if(success !== undefined){  // run the callback
          return success(key.publickey.toString(), privatekey.toString(), _id, (Date.now().valueOf()-_t)/1000)
        }

      } else {
        // not cracked, keep going

        crack_index = crack_index.add(1)
        if(crack_index.eq(end_index)){
          console.log('worker',_id,'reached limit')
          stop = true
          return fail(_id, key.publickey.toString(), (Date.now().valueOf()-_t)/1000)
        }
        if(crack_index.mod(10000).toNumber()===0){
          report(_id, crack_index.toString())
        }
        return setImmediate(start)
      }
    }
  }

  function end(){
    stop = true
  }

  function begin(){
    stop = false
    start()
  }

  return {
    update: update,
    begin: begin,
    end: end,
    index: function(new_index){
      crack_index = bignum(new_index)
    },
    success: function(f){
      success = f
    },
    fail: function(f){
      fail = f
    },
    report: function(f){
      report = f
    }
  }

}
