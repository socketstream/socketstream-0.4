"use strict";

/*!
 * Realtime Services
 * Server-side Library
 * Copyright(c) 2013 Owen Barnes <owen@socketstream.org>
 * MIT Licensed
 */


/**
 * Module dependencies.
 */

var fs = require('fs');
var path = require('path');
var Service = require('./service');


/**
 * SERVICE MANAGER
 */

function ServiceManager(options) {
  this.options = options || {};

  this.count = 0;
  this.services = {};
  this.api = {};

  
  this.root = this.options.root || __dirname;  // your app's root (used for relative paths)
  this.dir = this.options.dir || 'services';   // dir containing Service files
  this.log = this.options.log || function(){};

  this.rtsVersion = loadPackageJSON().version;
}


/**
 *
 * Register a new Service Definition
 *
 * Examples:
 *
 *    services.register('rpc', require('rts-rpc')())
 *
 * @param {String} name of service (must be unique and < 12 chars)
 * @param {Object} service definition object (see Realtime Service Spec)
 * @param {Object} options and overrides (e.g. don't send client libs)
 * @return {Object} instance of Service
 * @api public
 *  
 */

ServiceManager.prototype.register = function(name, definition, options) {
  options = options || {};

  // check for name uniqueness
  for (var serviceId in this.services) {
     if (this.services[serviceId].assigned.name === name)
       throw new Error('Service name ' + name + ' already used. Please choose another name.');
  }

  var assign = {
    id:           this.count++,
    name:         name,
    api:          this.api,
    root:         options.root || path.join(this.root, this.dir, name),
    log:          options.log || this.log,
    options:      options || {},
    rtsVersion:   this.rtsVersion
  };

  var service = new Service(definition, assign, this);
  this.services[assign.id] = service;
  return service;
};


/**
 *
 * Connect Services to Transport
 *
 * Examples:
 *
 *    services.connect(connection)
 *
 * @param {Object} a transport object
 * @return {null}
 * @api public
 *  
 */

ServiceManager.prototype.connect = function(connection) {
  for (var id in this.services) {
    var service = this.services[id];
    var serverApi = service.connect(connection);
    if (serverApi) this.api[service.assigned.name] = serverApi;
  }
  return null;
};


/**
 *
 * Process Incoming Messages from WebSocket Transport
 *
 * Examples:
 *
 *    services.onmessage('1|{"method": "callMe"}', {socketId: 1234});
 *
 * @param {String} the raw message in String form
 * @param {Object} an object containing details about the sender (socketId, sessionId, etc)
 * @return {null}
 * @api public
 *  
 */

ServiceManager.prototype.onmessage = function(msg, meta) {
  var attrs = {};
  var msgAry = msg.split('|');

  // First work out which service this is for
  var serviceId = msgAry.shift();
  var service = this.services[serviceId];

  // Parse optional message attributes  
  if (service.msgAttrs.length > 0) {
    for (var i = 0; i < service.msgAttrs.length; i++) {
      attrs[service.msgAttrs[i]] = msgAry[i];
    }
    msg = msgAry.slice(service.msgAttrs.length).join('|');
  }
 
  return service._server.read(msg, meta, attrs);
};


function loadPackageJSON() {
  try {
    return JSON.parse(fs.readFileSync(__dirname + '/package.json'));
  } catch (e) {
    throw('Error: Unable to find or parse ss-service package.json file');
  }
}

module.exports = ServiceManager;