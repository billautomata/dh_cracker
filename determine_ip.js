module.exports = function(){
  // determine IP
  var os = require('os');

  var interfaces = os.networkInterfaces();
  var addresses = [];
  for (var k in interfaces) {
      for (var k2 in interfaces[k]) {
          var address = interfaces[k][k2];
          if (address.family === 'IPv4' && !address.internal) {
              addresses.push(address.address);
          }
      }
  }

  console.log(addresses);
  var mask = '192.168.0.'
  var r
  addresses.forEach(function(a){
    if(a.indexOf(mask) !== -1){
      r = a
    }
  })
  return r
}
