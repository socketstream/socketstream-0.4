"use strict";

/*!
 * Realtime Service
 * Copyright(c) 2013 Owen Barnes <owen@socketstream.org>
 * MIT Licensed
 */


/**
 * Load objects to be passed to server() and client()
 */

var Server = require('./server');
var Client = require('../realtime-service-client');

function Service (definition, assigned, services) {
  if (typeof assigned.id === 'undefined') throw new Error("Service must have an ID");
  if (!assigned.name) throw new Error("Service must have a name");

  this.assigned = assigned;
  this.services = services;

  this.use = definition.use || {};
 
  this.serverApi = definition.server;
  this.clientApi = definition.client;

  this.private = definition.private || false;

  this.msgAttrs = [];
  if (this.use.callbacks) this.msgAttrs.push('callbackId');
}

Service.prototype.start = function(transport) {
  this.server = new Server(this, transport);
  return this.serverApi(this.server);
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

// A mock client used for testing - lot of work and thinking still to do here
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

module.exports = Service;

