// Client-side wrapper around Engine.IO

module.exports = function(client){

  var options; // TODO

  if (options == null) options = {};

  options.port = options.port || document.location.port || 80;

  var socket = new eio.Socket(options);

  socket.on('open', function(){

    socket.on('message', function(msg, meta) {
      console.log('Message in from server:', msg)
    });

    socket.on('ready', function(cb) {
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

    // First thing we should do is send session info
    //client.init();

  })

  return function(msg) {
    socket.send(msg);
  };

}