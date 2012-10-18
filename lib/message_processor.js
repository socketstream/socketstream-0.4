/*
   
   Message Processor
   -----------------
   Process incoming messages over the WS transport
   Doesn't do anything useful yet :)

*/

var Stream = require('stream')

module.exports = function(){

  var s = new Stream

  s.readable = true
  s.writable = true

  s.write = function(msg){
    console.log('Incoming message from websocket', msg)
  }

  return s
}