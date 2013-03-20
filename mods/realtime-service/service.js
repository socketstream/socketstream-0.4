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
}

Service.prototype.connect = function(transport) {
  this._server = new Server(this, transport);
  return this.serverApi(this._server);
};

Service.prototype.paramsForClient = function() {
  return {id: this.assigned.id, name: this.assigned.name, use: this.use};
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
}

Server.prototype.read = function(msg, meta) {
  var self = this, attrs = [];
  if (this.service.use.callbacks) {
    var i = msg.indexOf('|'), cbId = Number(msg.substr(0, i));
    msg = msg.substr(i + 1);
    meta._callbackId = cbId; // pass through to app
    attrs.push(cbId);
  }
  if (this.service.use.json) msg = JSON.parse(msg);
  this.onmessage(msg, meta, function(msg){
    self.sendToSocketId(meta.socketId, msg, attrs);
  });
};

Server.prototype.sendToSocketId = function(socketId, msg, attrs) {
  msg = this._prepareOutgoingMessage(msg, attrs);
  this.transport.sendToSocketId(socketId, this.service.assigned.id, msg);
};

Server.prototype.broadcast = function(msg) {
  msg = this._prepareOutgoingMessage(msg);
  this.transport.broadcast(this.service.assigned.id, msg);
};

Server.prototype.log = function(){
  var args = Array.prototype.slice.call(arguments);
  this.service.log.call(this.service, args);
};


/* Private methods */

Server.prototype._prepareOutgoingMessage = function(msg, attrs) {
  if (this.service.use.json) msg = JSON.stringify(msg);
  if (attrs) {
    attrs.push(msg);
    msg = attrs.join('|');
  }
  return msg;
};


module.exports = Service;

