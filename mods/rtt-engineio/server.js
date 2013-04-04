var engine = require('engine.io');

module.exports = function(options) {

  return function(connection) {

    // Start Engine.IO server
    var io = engine.listen(options.port, options.server);

    io.on('connection', function(socket) {
      
      // Grab it here as socket.requests gets removed when transport is upgraded
      var remoteAddress = socket.request.connection.remoteAddress;
  
      connection.events.emit('client:connect', socket.id);

      // Process incoming messages
      socket.on('message', function(msg){

        // Send meta details to the responder
        var meta = {
          transport:  'engineio',
          socketId:   socket.id,
          clientIp:   remoteAddress
        };

        connection.processIncomingMessage(msg, meta);

      });

      // Notify RTT when a client disconnects
      socket.on('close', function() {
        connection.events.emit('client:disconnect', socket.id);
      });

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
};