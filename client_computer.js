//
//  Client computer
//    * user interface for messaging
//    * generates keys
//    * communicates with the key server
//    * records and encrypts messages
//    * communicates with the message server
//
//

var crypto = require('crypto')
var bignum = require('bignum')

const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);
rl.setPrompt('?? > ');

var nbits = 12
var current_state_object
var username = 'foo'
var usermsg = ''

var alice

// console.log(process.stdout.columns, process.stdout.rows)

var name_message = [
  'Welcome to the Message Server! Let\'s send a Secure Message.',
  'It starts with secure keys that are unique to you.',
  'Secure keys are like a password, but based on the strength of math.',
  'You are using a key strength of ' + nbits.toString() + ' bits.',
  'Enter your name on the keyboard below...'
]

set_state({
  state: 'name',
  lines: name_message
})

rl.on('line', (line) => {

  if(line.trim() === ''){
    set_state()
    return;
  }

  switch(current_state){
    case 'name':
        username = line.trim()

        set_state({
          state: 'genkeys',
          lines: [
            'I am generating keys for you now...',
            'This may take a while for very large keys.'
          ]
        })

        alice = crypto.createDiffieHellman(nbits)
        alice.generateKeys()

        set_state({
          state: 'message',
          lines: [
            'Your keys are generated.',
            'Enter your message below...'
          ]
        })

      break;
    case 'message':

        set_state({
          state: 'encrypting',
          lines: [
            'We are currently encrypting your data.'
          ]
        })

        // build lines
        var encrypted_lines = []

        encrypted_lines.push('Your Message has been encrypted for __USER___')
        encrypted_lines.push('This is your encrypted data...')
        encrypted_lines.push('______________________________________')
        encrypted_lines = encrypted_lines.concat(
          split_string_to_lines(
            bignum.fromBuffer(alice.getPrivateKey()).toString(), Math.floor(process.stdout.columns/2)))

        set_state({
          state: 'encrypting',
          lines: encrypted_lines
        })

      break;
    default:
      set_state()
      break;
  }
}).on('close', () => {
  console.log('Have a great day!');
  process.exit(0);
});

function set_state(state_object){
  if(state_object !== undefined){
    current_state_object = state_object
  }
  current_state = current_state_object.state
  write_lines(current_state_object.lines)
  rl.prompt()
}


function split_string_to_lines(string, limit){
  var a = []
  var l = ''
  for(var i = 0; i < string.length; i++){
    l = l.concat(string[i])
    if(i % limit === 0 && i !== 0){
      a.push(l)
      l = ''
    }
  }
  a.push(l)
  console.log(a)
  return a
}


function write_lines(lines){
  var interesting_line_indexes = []
  var spacing = 2
  var begin_line_index = ((process.stdout.rows / 2) - Math.floor(lines.length / 2))

  for(var i = 0; i < lines.length; i++){
    interesting_line_indexes.push(Math.floor(begin_line_index + (i*spacing)))
  }
  // console.log(interesting_line_indexes)

  for(var i = 0; i < process.stdout.rows-1; i++){
    for(var j = 0; j < process.stdout.columns; j++){
      if((i < 3) || (i > process.stdout.rows-5)){
        process.stdout.write("∆")
      } else {
      }
    }
    if(interesting_line_indexes.indexOf(i) !== -1){
      // center line
      var begin_cursor = Math.floor((process.stdout.columns/2)-(lines[interesting_line_indexes.indexOf(i)].length/2))
      for(var k = 0; k < begin_cursor; k++){
        process.stdout.write(' ')
      }
      process.stdout.write(lines[interesting_line_indexes.indexOf(i)])
    }
    process.stdout.write('\n')
  }
}

setInterval(function(){},10000)
