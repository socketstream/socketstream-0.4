// Client-side wrapper around Engine.IO

var Stream = require('stream')

module.exports = function(client, options){

  options = options || {}
  options.port = options.port || document.location.port || 80

  var s = new Stream
  s.readable = true
  s.writable = true
  
  var socket = new eio.Socket(options)

  socket.on('open', function(){

    socket.on('message', function(msg) {
      //console.log('Message in from server:', msg)
      s.emit('data', msg)
    })

    socket.on('ready', function(cb) {
      return client.status.emit('ready');
    })

    socket.on('disconnect', function() {
      return client.status.emit('disconnect');
    })

    socket.on('reconnect', function() {
      return client.status.emit('reconnect');
    })

    socket.on('connect', function() {
      return client.status.emit('connect');
    })

  })

  s.write = function(msg) {
    socket.send(msg)
  }

  return s

}