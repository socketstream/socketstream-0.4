"use strict";

/*!
 * SocketStream Realtime Server
 * Copyright(c) 2013 Owen Barnes <owen@socketstream.org>
 * MIT Licensed
 */


/**
 * Module dependencies.
 */

var fs = require('fs');
var path = require('path');
var EventEmitter = require('events').EventEmitter;
var Service = require('../realtime-service');
var systemService = require('./lib/system');


/**
 *
 * Service Manager
 *
 * Examples:
 *
 * var server = new Server({
 *   root:    '/my/app/dir',
 *   dir:     'services',
 *   log:     console.log,
 *   events:  instanceOfAnEventEmitter
 * });
 * 
 * @param {Object} options
 * @return {Object} instance of ServiceManager
 * @api public
 *  
 */

function Server(options) {
  options = options || {};

  if (!options.root) throw new Error("You must supply an application root (e.g. {root: __dirname}");

  this.root = options.root;
  this.version = loadPackageJSON().version;

  this.count = 0;
  this.services = {};
  this.api = {};

  this.events = options.events || new EventEmitter();

  this.transport = options.transport || null;
  
  this.dir = options.dir || 'services';                 // dir containing Service data files
  this.log = options.log || function(){};
  this.sessionStore = options.sessionStore || false;    // will use default Connect Memory store if not set
  this.cacheSessions = options.cacheSessions || true;   // cache sessions in RAM (avoids hitting the store on each req)
 
  this._registerSystemService();
}


/**
 *
 * Register a new Service Definition
 *
 * Examples:
 *
 *    server.service('rpc', require('rts-rpc')())
 *
 * @param {String} name of service (must be unique and preferably < 12 chars)
 * @param {Object} service definition object (see Realtime Service Spec)
 * @param {Object} options and overrides (e.g. don't send client libs)
 * @return {Object} instance of Service
 * @api public
 *  
 */

Server.prototype.service = function(name, definition, options) {
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
    events:       this.events,
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
 * Start Server
 *
 * Examples:
 *
 *    server.start()
 *
 * @return {Object} server-side API
 * @api public
 *  
 */

Server.prototype.start = function(cb) {
  if (!this.transport) throw new Error('The server can only be started once a Realtime Transport has been defined. Set with server.transport()');

  var connection = this.transport.server(this);

  for (var id in this.services) {
    var service = this.services[id];
    var serverApi = service.start(connection);
    if (serverApi) this.api[service.assigned.name] = serverApi;
  }

  if (cb) cb(); // todo: callback when server really starts
  return this.api;
};



/**
 * Returns a list of all files which need to be sent to the browser
 *
 * @return {Array}
 * @api public
 *  
 */

Server.prototype.browserAssets = function() {
  var output = this.transport.browserAssets || [];
  for (var id in this.services) {
    var service = this.services[id];
    if (service.browserAssets && service.browserAssets.length) {
      output = output.concat(service.browserAssets);
    }
  }
  return output;
};




/**
 * Get a list of all non-private services which should be sent to the client
 *
 * @return {Array}
 * @api public
 *  
 */

Server.prototype.publicServices = function() {
  var buf = [];
  for (var id in this.services) {
    var service = this.services[id];
    if (service.private) continue;
    buf.push(service);
  }
  return buf;
};



/**
 *
 * Process Incoming Messages from WebSocket Transport
 *
 * Examples:
 *
 *    server.processIncomingMessage('1|{"method": "callMe"}', {socketId: 1234});
 *
 * @param {String} the raw message in String form
 * @param {Object} an object containing details about the sender (socketId, sessionId, etc)
 * @return {null}
 * @api public
 *  
 */

Server.prototype.processIncomingMessage = function(msg, meta) {
  var attrs = {};
  var msgAry = msg.split('|');

  // First work out which service this is for
  var serviceId = msgAry.shift();
  var service = this.services[serviceId];

  // Parse optional message attributes  
  if (service.msgAttrs.length > 0) {
    for (var i = 0; i < service.msgAttrs.length; i++) {
      attrs[service.msgAttrs[i]] = msgAry.shift();
    }
  }

  // Recombine message
  msg = msgAry.join('|');

  // If service doesn't require sessions, process right away
  if (!service.use.sessions) return service.server.read(msg, meta, attrs);

  // Otherwise, get Session object from in-memory cache or session store
  this.api._system.getSession(meta.socketId, function(err, session){
 
    meta.session = session;

    // Drop messages if we don't have a session
    if (meta.session) return service.server.read(msg, meta, attrs);

 });

};

Server.prototype._registerSystemService = function() {
  this.service('_system', systemService(this));
};


function loadPackageJSON() {
  try {
    return JSON.parse(fs.readFileSync(__dirname + '/package.json'));
  } catch (e) {
    throw('Error: Unable to find or parse ss-service package.json file');
  }
}

module.exports = Server;