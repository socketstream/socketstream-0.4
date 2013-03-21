"use strict";

// Engine.IO Websocket Transport

var engine = require('engine.io');
var parser = require('../ss-message-parser')(); // used to multiplex messages from multiple services


module.exports = function(options) {

  options = options || {};
  
  options.port = options.port || 3001;
  options.client = options.client || {port: options.port};
  options.server = options.server || {};

  // Return function to connect once HTTP server is started
  return function(transport) {

    transport.options = options;

    // Send Engine.IO client code to browser
    transport.app.clients.code.sendLibrary(__dirname + '/client_lib.js');

    // We're sending client code in-line at the moment. This is nasty and will change soon
    transport.client = require('./client');

    transport.connect = function() {

      // Start Engine.IO server
      var io = engine.listen(options.port, options.server);

      // // Enable Engine.IO to be configured
      // if (options.server) config.io(io);

      io.on('connection', function(socket) {

        // Grab it here as socket.requests gets removed when transport is upgraded
        var remoteAddress = socket.request.connection.remoteAddress;

        //transport.event.emit('ss:websocket:client:connect', socket.sessionId, socket.id);

        // Process incoming messages
        socket.on('message', function(msg){

          // Send meta details to the responder
          var meta = {
            socketId:   socket.id,
            sessionId:  '12345',  // TODO: implement sessions
            clientIp:   remoteAddress,
            transport:  'engineio'
          };

          var msgAry = parser.parse(msg);
          transport.processIncomingMessage(msgAry[0], msgAry[1], meta);

        });

        // Notify Event Bus when a client disconnects
        socket.on('close', function() {
          //app.eb.emit('ss:websocket:client:disconnect', socket.sessionId, socket.id);
        });

        socket.emit('ready');

      });

      return {

        sendToSocketId: function(socketId, serviceId, msg) {
          io.clients[socketId].send(parser.serialize([serviceId, msg]));
        },

        broadcast: function(serviceId, msg){
          for (var socketId in io.clients) {
            io.clients[socketId].send(parser.serialize([serviceId, msg]));
          }
        }
      };

    };
  };
};

