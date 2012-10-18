// Engine.IO Websocket Transport
// Note we will be able to simplify a lot of this code once Engine.IO supports a streaming interface

var Stream = require('stream'),
    engine = require('engine.io');

var openSocketsById = {};

module.exports = function(app, options) {

  if (options == null) options = {};
  
  options.client = options.client || {};
  options.server = options.server || {};

  // Send Engine.IO client code to browser
  app.clients.code.sendLibrary(__dirname + '/client_lib.js');

  // Send small wrapper module to make it obey the standard interface
  app.clients.code.sendModule('socketstream-transport', __dirname + '/client_wrapper.js');

  // Return function to connect once HTTP server is started
  return function(httpServer, muxdemux) {

    // Implement very basic Streams wrapper until Engine.IO supports this
    var s = new Stream
    s.readable = true
    s.writable = true

    // Start Engine.IO server
    var io = engine.attach(httpServer);

    // // Enable Engine.IO to be configured
    // if (options.server) config.io(io);

    // Allow data to be sent to all connected clients
    // TODO: Find the best way to only send to *specific* clients
    // E.g. those subscribed to a particular channel
    s.write = function(buf) {

      console.log('writing to websocket')

      for (id in io.clients) {
        io.clients[id].send(buf)
      }


    }

    io.on('connection', function(socket) {

      app.eb.emit('ss:websocket:client:connect', socket.sessionId, socket.id);

      // Process incoming messages
      socket.on('message', function(msg){

        // TODO: Figure out how to get a client's IP from Engine.IO
        var clientIp = 'XXX.XXX.XXX.XXX'

        // Send meta details to the responder
        var meta = {
          socketId:   socket.id,
          sessionId:  '12345',  // TODO: implement sessions
          clientIp:   clientIp,
          transport:  'engineio'
        };

        // Send through to message processor
        s.emit('data', [msg, meta])

      });


      // Notify Event Bus when a client disconnects
      socket.on('close', function() {
        app.eb.emit('ss:websocket:client:disconnect', socket.sessionId, socket.id);
      });

      //return socket.emit('ready');

    });

    return s

  }

}

