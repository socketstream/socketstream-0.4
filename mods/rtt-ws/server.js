"use strict";

/*!
 * WebSocket Realtime Transport - Server
 * Copyright(c) 2013 Owen Barnes <owen@socketstream.org>
 * MIT Licensed
 */

var WebSocketServer = require('ws').Server;

module.exports = function(options) {

  options.interface = options.interface || '0.0.0.0';

  var clientCount = 0;
  var clients = {};

  return function(connection) {

    var ws = new WebSocketServer({port: options.port});

    ws.on('connection', function(socket) {

      // Assign SocketID
      socket.id = String(++clientCount);

      clients[socket.id] = socket;

      connection.events.emit('client:connect', socket.id);

      socket.on('message', function(message) {

        var request = {
          message:    message,
          transport:  'ws',
          socketId:   socket.id,
          clientIp:   socket.upgradeReq.headers.host.split(':')[0]
        };

        connection.process(request);

      });

      socket.on('close', function() {
        connection.events.emit('client:disconnect', socket.id);
        delete clients[socket.id];
      });

    });

    return {

      sendToSocketId: function(socketId, msg) {
        clients[socketId].send(msg);
      },

      broadcast: function(msg){
        for (var socketId in clients) {
          clients[socketId].send(msg);
        }
      }

    };

  };
};