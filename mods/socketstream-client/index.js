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

  self._transport = null;
}

// Set Transport
SocketStream.prototype.transport = function(handler, options) {
  this._transport = handler(options);
};

SocketStream.prototype.connect = function() {
  var connection = this._transport(this, this._transportConfig);
  this.services.connect(connection);
};

module.exports = SocketStream;
