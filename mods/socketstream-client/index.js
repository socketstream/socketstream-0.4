// SocketStream 0.4 Client (sent to browser)

var EE = require('events').EventEmitter;

/*

  Main Client

*/

function SocketStream(){
  var self = this;
  self.status = new EE();
  self.conn = null;
  self._transport = null;
  self.services = new ServiceClient();

  this.services.write = function(serviceId, msg) {
    self.conn(serviceId, msg);
  };

}

// Set Transport
SocketStream.prototype.transport = function(handler) {
  this._transport = handler;
};

SocketStream.prototype.connect = function() {
  this.conn = this._transport(this);
};



/*

  Service Client

*/

function ServiceClient(options) {
  this.transport = null;
  this.services = {};
  this.api = {};
}

ServiceClient.prototype.register = function(params, handler) {
  var service = new Service(params.id, params.name, this, params.config);
  this.services[service.id] = service;
  var api = handler(service);
  if (api) this.api[service.name] = api;
};

/*

  An Individual Service

*/

function Service(id, name, services, options) {
  this.id = id;
  this.name = name;
  this.services = services;
  this.options = options || {};

  // for optional callbacks
  this.cbCount = 0;
  this.cbStack = {};
}

Service.prototype.read = function(msg) {
  var cbId, cb = null;
  if (this.options.callbacks) {
    var i = msg.indexOf('|');
    cbId = msg.substr(0, i);
    msg = msg.substr(i + 1);
    if (cbId) cb = this.cbStack[cbId];
    if (!cb) throw "SocketStream: No callback found for service " + this.name;
    
  }
  if (this.options.json) msg = JSON.parse(msg);
  this.onmessage(msg, cb);
  if (cbId) delete this.cbStack[cbId];
};

Service.prototype.write = function(msg, cb) {
  if (this.options.json) msg = JSON.stringify(msg);
  if (this.options.callbacks) {
    var cbId = ++this.cbCount;
    this.cbStack[cbId] = cb;
    msg = cbId + '|' + msg;
  }
  this.services.write(this.id, msg);
};

module.exports = SocketStream;
