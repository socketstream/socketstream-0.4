// SocketStream Browser Client

var EventEmitter = require('events.js').EventEmitter,
    MuxDemux = require('mux-demux'),
    transport = require('socketstream-transport'),
    Stream = require('stream')


function SocketStream(){

  var self = this

  self.status = new EventEmitter

  self.responders = {}
  self.services = {}

  self.registerService = function (id, code) {
    var s = new Stream
    s.readable = true
    s.writable = true

    // Expose a function or object to the application
    s.expose = function(name, fn) {
      self.services[name] = fn
    }

    code(s)
    self.responders[id] = s
  }

  var mdm = MuxDemux(function(stream) {
    var responder = self.responders[stream.meta]
    if (responder) stream.pipe(responder).pipe(stream)
  })

  // Connect to server
  var connection = transport(self)

  // Wire up stream multiplexer
  connection.pipe(mdm).pipe(connection)

  return self

}

// Singleton for the browser
var app = new SocketStream
module.exports = function(){
  return app
}

