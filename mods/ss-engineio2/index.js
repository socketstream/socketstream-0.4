"use strict";

// Engine.IO Websocket Transport

var engine = require('engine.io');
var parser = require('ss-message-parser')(); // used to multiplex messages from multiple services


module.exports = function(options) {

  if (options === null) options = {};
  
  options.port = options.port || 3001;
  options.client = options.client || {};
  options.server = options.server || {};

  // Return function to connect once HTTP server is started
  return function(transport) {

    // Send Engine.IO client code to browser
    transport.app.clients.code.sendLibrary(__dirname + '/client_lib.js');

    // We're sending client code in-line at the moment. This is nasty and will change soon
    transport.client = function(client) {

      var parser = require('ss-message-parser')();

      var socket = new eio('ws://localhost:3001');

      socket.on('open', function(){
        return client.status.emit('open');
      });

      socket.on('ready', function() {
        return client.status.emit('ready');
      });

      socket.on('disconnect', function() {
        return client.status.emit('disconnect');
      });

      socket.on('reconnect', function() {
        return client.status.emit('reconnect');
      });

      socket.on('connect', function() {
        return client.status.emit('connect');
      });

      socket.on('message', function(msg) {
        console.log('Message in from server:', msg);
        var msgAry = parser.parse(msg);
        client.services.services[msgAry[0]].read(msgAry[1]);
      });

      // Return Send Method
      return function(serviceId, content) {
        var msg = parser.serialize([serviceId, content]);
        socket.send(msg);
      };

    },

    transport.connect = function() {

      // Start Engine.IO server
      var io = engine.listen(options.port);

      // // Enable Engine.IO to be configured
      // if (options.server) config.io(io);

      io.on('connection', function(socket) {

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
          transport.services[msgAry[0]].read(msgAry[1], meta);

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

