"use strict";

/*

  Service Manager

*/

require('colors');
var fs = require('fs');

function ServiceManager(options) {
  this.app = options;
  this.count = 0;
  this.services = {};
  this.api = {};
  this.conn = null;
}

ServiceManager.prototype.create = function(name, mod, options) {
  // check name is unique and not too long
  if (name.length > 12) throw new Error("Serivce name '" + name + "' must be 12 chars or less");
  for (var serviceId in this.services) {
     if (this.services[serviceId].name === name)
       throw new Error('Service name ' + name + ' already loaded. Please choose another name.');
  }

  var id = this.count++;
  var service = new Service(id, name, options, this);
  this.services[id] = service;
  return mod(service);
};

ServiceManager.prototype.start = function(connection) {
  this.conn = connection;
  for (var id in this.services) {
    var service = this.services[id];
    this.api[service.name] = service.start();
  }
};


/*

  An Individual Service

*/

function Service(id, name, options, services) {
  this.id = id;
  this.name = name;
  this.services = services;
  this.config = {};
  this.clientLibraries = [];
  this.app = services.app;
}

/* Websocket Transport Methods */

Service.prototype.read = function(msg, meta, response) {
  var self = this, attrs = [];
  if (this.config.callbacks) {
    var i = msg.indexOf('|'), cbId = Number(msg.substr(0, i));
    msg = msg.substr(i + 1);
    meta._callbackId = cbId; // pass through to app
    attrs.push(cbId);
  }
  if (this.config.json) msg = JSON.parse(msg);
  this.onmessage(msg, meta, function(msg){
    self.sendToSocketId(meta.socketId, msg, attrs);
  });
};

Service.prototype.sendToSocketId = function(socketId, msg, attrs) {
  msg = this._prepareOutgoingMessage(msg, attrs);
  this.services.conn && this.services.conn.sendToSocketId(socketId, this.id, msg);
};

Service.prototype.broadcast = function(msg) {
  msg = this._prepareOutgoingMessage(msg);
  this.services.conn && this.services.conn.broadcast(this.id, msg);
};


/* Asset Sending Methods (TODO: a seperate library should do this!) */

Service.prototype.sendClientLibrary = function(filename) {
  var code = fs.readFileSync(filename, 'utf8');
  this.clientLibraries.push(code);
};

Service.prototype.sendClientCode = function(filename) {
  var code = fs.readFileSync(filename, 'utf8');
  this.client = code;
};


/* Util methods */

Service.prototype.log = function(){
  var args = Array.prototype.slice.call(arguments);
  var name = this.name;
  while (name.length < 12) name = ' ' + name;
  args.unshift(name.grey);
  console.log.apply(console, args);
};

Service.prototype.paramsForClient = function() {
  return {id: this.id, name: this.name, config: this.config};
};


/* Private methods */

Service.prototype._prepareOutgoingMessage = function(msg, attrs) {
  if (this.config.json) msg = JSON.stringify(msg);
  if (attrs) {
    attrs.push(msg);
    msg = attrs.join('|');
  }
  return msg;
};

module.exports = ServiceManager;