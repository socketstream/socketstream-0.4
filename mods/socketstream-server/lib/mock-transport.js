"use strict";

/*!
 * SocketStream Realtime Server - Mock Realtime Transport
 *
 * A simple EventEmitter used for internal testing and benchmarking
 *
 * Copyright(c) 2013 Owen Barnes <owen@socketstream.org>
 * MIT Licensed
 */

var EventEmitter = require('events').EventEmitter;

module.exports = function(options) {

  var EE = new EventEmitter();

  return {
    server: function(server) {

      EE.on('msgForServer', function(msg) {

        var request = {
          message:    msg,
          transport:  'mock',
          socketId:   '1',
          clientIp:   '127.0.0.1'
        };

        server.process(request);

      });

      return {

        sendToSocketId: function(socketId, msg) {
          EE.emit('msgForClient', msg);
        },

        broadcast: function(msg){
          EE.emit('msgForClient', msg);
        }
      };

    },

    client: function() {

      return function(client) {

        EE.on('msgForClient', function(msg) {
          client.process({message: msg});
        });

        // TODO: Change the connect order so we don't have to do this!
        setTimeout(function(){
          client.status.emit('open');
        }, 1);


        // Return API
        return {

          disconnect: function() {
          },

          write: function(msg) {
            EE.emit('msgForServer', msg);
          }
        };


      };

    }
  };
};

