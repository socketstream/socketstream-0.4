"use strict";

var Client = require('../realtime-service-client');

/*

  A SERVICE

*/

function Service (definition, assigned, services) {
  if (typeof assigned.id === 'undefined') throw new Error("Service must have an ID");
  if (!assigned.name) throw new Error("Service must have a name");

  this.assigned = assigned;
  this.services = services;

  this.use = definition.use || {};
 
  this.serverApi = definition.server;
  this.clientApi = definition.client;

  this.msgAttrs = [];
  if (this.use.callbacks) this.msgAttrs.push('callbackId');
}

Service.prototype.connect = function(transport) {
  this._server = new Server(this, transport);
  return this.serverApi(this._server);
};

Service.prototype.paramsForClient = function() {
  return {
    id:       this.assigned.id,
    name:     this.assigned.name,
    options:  this.assigned.options,
    use:      this.use
  };
};

Service.prototype.relativeRoot = function() {
  var l = this.services.root.length;
  return '.' + this.assigned.root.substr(l);
};

Service.prototype.log = function(args) {
  if (this.assigned.log) {
    args.unshift(this.assigned.name); // append service name
    this.assigned.log.apply(this.assigned.log, args);
  }
};

// A fake client used for testing - lot of work and thinking still to do here
Service.prototype.testClient = function() {
  var self = this;

  var client = new Client();

  var serverTransport = {
    sendToSocketId: function(fake, serviceId, msg) {
      client.processIncomingMessage(self.assigned.id, msg);
    }
  };

  var clientTransport = {
    write: function(serviceId, msg) {
      var meta = {transport: 'fakedForTest'};
      server.read(msg, meta);
    }
  };

  var server = new Server(this, serverTransport);
  
  var clientApi = client.register(this.paramsForClient(), this.clientApi);
  client.connect(clientTransport);
  this.serverApi(server);

  return clientApi;
};



/*

  SERVER OBJECT

*/

function Server(service, transport) {
  this.service = service;
  this.transport = transport;

  this.events = service.assigned.events;
}

Server.prototype.read = function(msg, meta, attrs) {
  var self = this; 

  // Try to fetch Callback ID
  var cbId = Number(attrs.callbackId);
  if (cbId) meta._callbackId = cbId;

  if (this.service.use.json) msg = JSON.parse(msg);

  this.onmessage(msg, meta, function(msg){
    self.sendToSocketId(meta.socketId, msg, {callbackId: cbId});
  });
};

Server.prototype.sendToSocketIds = function(socketIds, msg, attrs) {
  msg = this._prepareOutgoingMessage(msg, attrs);
  if (typeof socketIds !== 'object') socketIds = [socketIds];
  socketIds.forEach(function(socketId) {
    this.transport.sendToSocketId(socketId, msg);
  }, this);
};

// Alias
Server.prototype.sendToSocketId = Server.prototype.sendToSocketIds;

Server.prototype.broadcast = function(msg) {
  msg = this._prepareOutgoingMessage(msg);
  this.transport.broadcast(msg);
};

Server.prototype.log = function(){
  var args = Array.prototype.slice.call(arguments);
  this.service.log.call(this.service, args);
};

Server.prototype.debug = function(){
  if (!this.service.assigned.options.debug) return;
  var args = Array.prototype.slice.call(arguments);
  args.unshift('DEBUG');
  this.service.log.call(this.service, args);
};



/* Private methods */

Server.prototype._prepareOutgoingMessage = function(msg, attrs) {
  if (this.service.use.json) msg = JSON.stringify(msg);

  var buf = [this.service.assigned.id];
  
  // Encode attributes into message if they exist
  if (this.service.msgAttrs.length > 0) {
    this.service.msgAttrs.map(function(attrName){
      buf.push(attrs && attrs[attrName] || '');
    });
  }

  buf.push(msg);

  return buf.join('|');
};


module.exports = Service;

