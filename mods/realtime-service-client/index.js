"use strict";

/*

  Realtime Service Client

*/

function Services() {
  this.services = {};
  this.api = {};
}

Services.prototype.register = function(params, handler) {
  var service = new Service(this, params);
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

function Service(services, params) {
  this.services = services;

  this.id = params.id;
  this.name = params.name;
  this.use = params.use || {};
  this.options = params.options || {};
  this.transport = null;

  // for optional callbacks
  this.cbCount = 0;
  this.cbStack = {};

  this.msgAttrs = [];
  if (this.use.callbacks) this.msgAttrs.push('callbackId');
}

Service.prototype.connect = function(transport) {
  this.transport = transport;
};

Service.prototype.read = function(msg) {
  var attrs = {}, cb = null;

  // Parse message attributes  
  if (this.msgAttrs.length > 0) {
    var msgAry = msg.split('|');
    for (var i = 0; i < this.msgAttrs.length; i++) {
      attrs[this.msgAttrs[i]] = msgAry[i];
    }
    msg = msgAry.slice(this.msgAttrs.length).join('|');
  }

  // Try to fetch Callback ID
  var cbId = Number(attrs.callbackId);
  if (cbId) cb = this.cbStack[cbId];

  // Decode to object
  if (this.use.json) msg = JSON.parse(msg);

  // Fire callback or pass to generic onmessage handler
  (cb || this.onmessage)(msg);

  // Clean up and callback
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

/**
 * Browser-friendly debug
 */

Service.prototype.debug = function() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift('DEBUG ' + this.name + ':');
  if (this.options.debug) {
    if (window.console && console.log)
      Function.prototype.apply.call(console.log, console, args);
  }
};


module.exports = Services;