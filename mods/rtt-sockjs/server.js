"use strict";

/*!
 * SockJS Realtime Transport - Server
 * Copyright(c) 2013 Owen Barnes <owen@socketstream.org>
 * MIT Licensed
 */

var http = require('http');
var sockjs = require('sockjs');

module.exports = function(options) {

  options.interface = options.interface || '0.0.0.0';

  var clients = {};

  return function(connection) {

    // Start SockJS server
    var ws = sockjs.createServer();

    ws.on('connection', function(conn) {

      clients[conn.id] = conn;

      connection.events.emit('client:connect', conn.id);

      conn.on('data', function(msg) {

        var meta = {
          transport:  'sockjs',
          socketId:   conn.id,
          clientIp:   conn.remoteAddress,
          protocol:   conn.protocol
        };

        connection.processIncomingMessage(msg, meta);

      });

      conn.on('close', function() {
        connection.events.emit('client:disconnect', conn.id);
        delete clients[conn.id];
      });

    });

    var server = http.createServer();
    ws.installHandlers(server, {prefix:'/rtt'});
    server.listen(options.port, options.interface);

    return {

      sendToSocketId: function(socketId, msg) {
        clients[socketId].write(msg);
      },

      broadcast: function(msg){
        for (var socketId in clients) {
          clients[socketId].write(msg);
        }
      }
    };

  };
};