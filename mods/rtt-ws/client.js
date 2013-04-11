"use strict";

/*!
 * WebSocket Realtime Transport - Client
 * Copyright(c) 2013 Owen Barnes <owen@socketstream.org>
 * MIT Licensed
 */

var WebSocket = require('ws');

module.exports = function(options) {

  options = options || {};
  options.protocol = options.protocol || 'ws';
  options.host = options.host || 'localhost';

  options.reconnection = options.reconnection || {
    attempts: Infinity,
    minDelay: 1000,
    maxDelay: 8000
  };
  
  var attemptReconnect = true;
  var reconnectionAttempts = 0;
  var reconnecting = false;

  function debug() {
    var args = Array.prototype.slice.call(arguments);
    if (options.debug) console.log.apply(console, args);
  }

  // Connect
  return function (client) {

    var ws;
    var url = options.protocol + '://' + options.host + ':' + options.port;

    function connect(){

      debug('Connecting to', url);
      
      ws = new WebSocket(url);

      ws.onopen = function() {
        return client.status.emit('open');
      };

      ws.onmessage = function(obj, flags) {
        // flags.binary will be set if a binary data is received
        // flags.masked will be set if the data was masked
        debug('RECV', obj.data);
        client.process({message: obj.data});
      };

      ws.onclose = function() {
        client.status.emit('close');
        reconnect();
      };

    }

    function reconnect() {
      if (!attemptReconnect) return;

      // Attempt reconnection
      // Note: most of this logic is from socket.io-client at the moment
      reconnectionAttempts++;

      if (reconnectionAttempts > options.reconnection.attemps) {
        client.status.emit('reconnect_failed');
        reconnecting = false;
      } else {
        var delay = reconnectionAttempts * options.reconnection.minDelay;
        delay = Math.min(delay, options.reconnection.maxDelay);
        debug('Waiting %dms before reconnect attempt', delay);

        reconnecting = true;
        var timer = setTimeout(function(){
          debug('Attempting reconnect...');
          connect();
        }, delay);
      }
    }

    connect();

    // Return API
    return {

      disconnect: function() {
        attemptReconnect = false;
        ws.close();
      },

      write: function(msg) {
        debug('SEND', msg);
        ws.send(msg);
      }

    };

  };

};