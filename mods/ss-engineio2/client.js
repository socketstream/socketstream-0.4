module.exports = function(options) {

  options.protocol = options.protocol || 'ws';
  options.host = options.host || 'localhost';

  var parser = require('ss-message-parser')();

  // Connect
  return function (client) {
   
    var socket = new eio(options.protocol + '://' + options.host + ':' + options.port);

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
      var msgAry = parser.parse(msg);
      client.services.processIncomingMessage(msgAry[0], msgAry[1]);
    });

    // Return API
    return {

      write: function(serviceId, content) {
        var msg = parser.serialize([serviceId, content]);
        socket.send(msg);
      }

    };

  }

};