"use strict";

/*

  Realtime Service Client

*/

function Services() {
  this.services = {};
  this.api = {};
}

Services.prototype.register = function(params, handler) {
  var service = new Service(params.id, params.name, this, params.use);
  this.services[service.id] = service;
  var api = handler(service);
  if (api) this.api[service.name] = api;
  return api;
};

Services.prototype.connect = function(connection) {
  for (var id in this.services) {
    var service = this.services[id];
    service.connect(connection);
  }
};


Services.prototype.processIncomingMessage = function(serviceId, msg) {
  var service = this.services[serviceId];
  if (service) {
    service.read(msg);
  } else {
    throw('Unable to process incoming message. Service ID ' + serviceId + ' not found');
  }
};

/*

  An Individual Service

*/

function Service(id, name, services, use) {
  this.id = id;
  this.name = name;
  this.services = services;
  this.use = use || {};
  this.transport = null;

  // for optional callbacks
  this.cbCount = 0;
  this.cbStack = {};
}

Service.prototype.connect = function(transport) {
  this.transport = transport;
};

Service.prototype.read = function(msg) {
  var cbId, cb = null;
  if (this.use.callbacks) {
    var i = msg.indexOf('|');
    cbId = msg.substr(0, i);
    msg = msg.substr(i + 1);
    if (cbId) cb = this.cbStack[cbId];
    if (!cb) throw "No callback found for service " + this.name;
  }
  if (this.use.json) msg = JSON.parse(msg);
  var fn = cb || this.onmessage;
  fn(msg);
  if (cbId) delete this.cbStack[cbId];
};

Service.prototype.send = function(msg, cb) {
  if (this.use.json) msg = JSON.stringify(msg);
  if (this.use.callbacks) {
    var cbId = ++this.cbCount;
    this.cbStack[cbId] = cb;
    msg = cbId + '|' + msg;
  }
  this.transport.write(this.id, msg);
};

module.exports = Services;