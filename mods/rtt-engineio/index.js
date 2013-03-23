"use strict";

// Engine.IO Realtime Transport Spec

var engine = require('engine.io');

module.exports = function(options) {

  options = options || {};
  
  options.port = options.port || 3001;
  options.client = options.client || {};
  options.server = options.server || {};
  options.client.port = options.port;

  var transport = {};

  // Send Engine.IO client code to browser
  transport.clientAssets = [{filename: __dirname + '/engineio_client.js', type: 'js'}];

  transport.client = require('./client');

  transport.server = function(connection) {

    // Start Engine.IO server
    var io = engine.listen(options.port, options.server);

    io.on('connection', function(socket) {

      // Grab it here as socket.requests gets removed when transport is upgraded
      var remoteAddress = socket.request.connection.remoteAddress;

      connection.status.emit('client:connect', socket.id);

      // Process incoming messages
      socket.on('message', function(msg){

        // Send meta details to the responder
        var meta = {
          socketId:   socket.id,
          sessionId:  '12345',  // TODO: implement sessions
          clientIp:   remoteAddress,
          transport:  'engineio'
        };

        connection.onmessage(msg, meta);

      });

      // Notify RTT when a client disconnects
      socket.on('close', function() {
        connection.status.emit('client:disconnect', socket.id);
      });

      socket.emit('ready');

    });

    return {

      sendToSocketId: function(socketId, msg) {
        io.clients[socketId].send(msg);
      },

      broadcast: function(msg){
        for (var socketId in io.clients) {
          io.clients[socketId].send(msg);
        }
      }
    };

  };

  transport.options = options;

  return transport;
};

