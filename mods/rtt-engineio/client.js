module.exports = function(options) {

  var parser = require('ss-message-parser')();

  options = options || {};
  options.protocol = options.protocol || 'ws';
  options.host = options.host || 'localhost';

  options.reconnection = options.reconnection || {
    attempts: Infinity,
    minDelay: 1000,
    maxDelay: 5000
  };
  
  var attemptRedirect = true;
  var reconnectionAttempts = 0;
  var reconnecting = false;

  // TODO: Move this to transport lib
  var debug = function() {
    var args = Array.prototype.slice.call(arguments);
    if (options.debug) console.log.apply(console, args);
  };

  // Connect
  return function (client) {
   
    var socket = new eio(options.protocol + '://' + options.host + ':' + options.port);

    var reconnect = function() {
      if (!attemptRedirect) return;

      // Attempt reconnection
      // Note: most of this logic is from socket.io-client at the moment
      var self = this;
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

          socket.open(function(err){
            if (err) {
              debug('Reconnect attempt error :(');
              reconnect();
              return client.status.emit('reconnect_error', err.data);
            } else {
              debug('Reconnect success! :)');
              reconnectionAttempts = 0;
              reconnecting = false;
              return client.status.emit('reconnected');
            }
          });

        }, delay);
      }
    };

    socket.on('open', function(){
      return client.status.emit('open');
    });

    socket.on('close', function() {
      client.status.emit('close');
      reconnect();
    });

    socket.on('message', function(msg) {
      debug('RECV', msg);
      var msgAry = parser.parse(msg);
      client.services.processIncomingMessage(msgAry[0], msgAry[1]);
    });

    // Return API
    return {

      disconnect: function() {
        attemptRedirect = false;
        socket.close();
      },

      write: function(serviceId, content) {
        var msg = parser.serialize([serviceId, content]);
        debug('SEND', msg);
        socket.send(msg);
      }

    };

  };

};