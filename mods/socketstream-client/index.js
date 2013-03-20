// SocketStream 0.4 Client (sent to browser)

var EE = require('events').EventEmitter;
var ServiceClient = require('realtime-service-client');

/*

  Main Client

*/

function SocketStream(){
  var self = this;
  self.status = new EE();
  self.services = new ServiceClient();

  self._connection = null;
  self._transport = null;
}

// Set Transport
SocketStream.prototype.transport = function(handler) {
  this._transport = handler;
};

SocketStream.prototype.connect = function() {
  var connection = this._transport(this);
  this.services.connect(connection);
};

module.exports = SocketStream;
