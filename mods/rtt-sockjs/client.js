"use strict";

/*!
 * SockJS Realtime Transport - Browser-only Client
 * Copyright(c) 2013 Owen Barnes <owen@socketstream.org>
 * MIT Licensed
 */

 /* global SockJS */

module.exports = function(options) {

  // This is the browser client for SockJS
  // Unfortunately the Node client has a different API is isn't fully developed :(
  if (typeof window === 'undefined') throw("Sorry, the SockJS Client does not work in a Node process\n");

  options = options || {};
  options.protocol = options.protocol || 'http';
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

    var sock;
    var url = options.protocol + '://' + options.host + ':' + options.port + '/rtt';

    function connect(){

      debug('Connecting to', url);
      
      sock = new SockJS(url);
      
      sock.onopen = function() {
        return client.status.emit('open');
      };

      sock.onclose = function() {
        client.status.emit('close');
        reconnect();
      };

      sock.onmessage = function(obj) {
        var msg = obj.data;
        debug('RECV', msg);
        client.processIncomingMessage(msg);
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
        sock.close();
      },

      write: function(msg) {
        debug('SEND', msg);
        sock.send(msg);
      }

    };

  };

};