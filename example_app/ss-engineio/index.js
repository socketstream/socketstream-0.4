// Engine.IO Websocket Transport
// Note we will be able to simplify a lot of this code once Engine.IO supports a streaming interface

var Stream = require('stream'),
    engine = require('engine.io')

var openSockets = {}

module.exports = function(app, options) {

  if (options == null) options = {}
  
  options.client = options.client || {}
  options.server = options.server || {}

  // Send Engine.IO client code to browser
  app.clients.code.sendLibrary(__dirname + '/client_lib.js')

  // Send small wrapper module to make it obey the standard interface
  app.clients.code.sendModule('socketstream-transport', __dirname + '/client_wrapper.js')

  // Return function to connect once HTTP server is started
  return function(httpServer) {

    // Start Engine.IO server
    var io = engine.attach(httpServer);

    // // Enable Engine.IO to be configured
    // if (options.server) config.io(io);

    io.on('connection', function(socket) {

      var connectionStream = new Stream()
      connectionStream.readable = true
      connectionStream.writable = true

      app.eb.emit('ss:websocket:client:connect', socket.sessionId, socket.id)

      // Process incoming messages
      socket.on('message', function(msg){

        // Send meta details to the responder
        var meta = {
          socketId:   socket.id,
          sessionId:  '12345',  // TODO: implement sessions
          //clientIp:   socket.request.connection.remoteAddress,
          transport:  'engineio'
        }

        // Send through to message processor
        connectionStream.emit('data', msg)

      })

      // Notify Event Bus when a client disconnects
      socket.on('close', function() {
        app.eb.emit('ss:websocket:client:disconnect', socket.sessionId, socket.id)
        delete openSockets[socket.id]
      })

      //return socket.emit('ready');

      connectionStream.write = function(buf) {
        socket.send(buf)
      }

      // Define streams
      var mdm = app.switchboard.createClient(socket.id)

      // Wire it up
      mdm.pipe(connectionStream)
      connectionStream.pipe(mdm)

      openSockets[socket.id] = socket

    })

    return openSockets

  }
}

