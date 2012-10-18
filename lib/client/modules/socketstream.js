// SocketStream Browser Client

var EventEmitter = require('events.js').EventEmitter,
    transport = require('socketstream-transport')

module.exports = function(){

  var self = this

  self.status = new EventEmitter

  // Connect to server
  var connection = transport(self)

  // Send test message
  connection('This message was sent from the browser')

}

