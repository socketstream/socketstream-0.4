/*
   
   Switchboard
   -----------
   Handle the one server to many clients, each with many streams relationship
   
   Right now you can pipe() data into a server-side stream and it will be sent to ALL client
   TODO: We need to be able to filter by socketID, sessionId, and channels?

*/

var Stream = require('stream'),
    MuxDemux = require('mux-demux')


function Hub () {
  this.clients = {}
  this.services = {}
  this.serviceCount = 0
}

// Create a Stream Service on the server
Hub.prototype.createService = function() {
  var s = new Stream

  s.setMaxListeners(9999999) // ouch! as every incoming connection needs to pipe() to every service

  s.readable = true
  s.writable = true

  // Assign incremental unique ID
  s.id = ++this.serviceCount

  this.services[s.id] = s

  return s
}

// Create a duplex stream for each Service
Hub.prototype.createClient = function(clientId) {
  var self = this

  // Create new multiplexer for each connected client
  var mdm = new MuxDemux

  // Wait for pipe before attaching streams to ensure meta data is sent to browser
  mdm.on('pipe', function(){

    var streams = {}

    function createStream (serviceId) {

      var service = self.services[serviceId]
      var stream = mdm.createStream(serviceId)

      // Create a new stream to allow us to inject meta data
      // so we know which client is writing
      var ms = new Stream
      ms.readable = true
      ms.writable = true
      ms.write = function(msg) {
        ms.emit('data', [msg, {socketId: clientId}, stream])
      }

      // Add meta data to all incoming messages then send to service
      stream.pipe(ms).pipe(service)

      // Any writes to the service will be sent to all connected clients (broadcast)
      service.pipe(stream)

      return stream
    }

    for (serviceId in self.services) {
      streams[serviceId] = createStream(serviceId)
    }

    self.clients[clientId] = streams

  })

  return mdm
}

module.exports = Hub 