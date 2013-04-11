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
var Request = require('./lib/request');
var systemService = require('./lib/system-service');


/**
 *
 * Service Manager
 *
 * Examples:
 *
 * var server = new Server({
 *   root:          '/my/app/dir',
 *   dir:           'services',
 *   log:           console.log,
 *   events:        instanceOfAnEventEmitter,
 *   sessionStore:  new RedisStore({port: 6379}),
 *   cacheSessions: true
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

  this.serviceCount = 0;
  this.services = {};
  this.api = {};
  this.middleware = [];

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
 * Use a Realtime Service
 *
 * Examples:
 *
 *    server.service('rpc', require('rts-rpc')())
 *
 * @param {String} name of service (must be unique and < 12 chars)
 * @param {Object} service definition object (see Realtime Service Spec)
 * @param {Object} options and overrides (e.g. don't send client libs)
 * @return {Object} instance of Service
 * @api public
 *  
 */

Server.prototype.service = function(name, definition, options) {
  options = options || {};

  // check name length
  if (name.length > 12) throw new Error("Service name '" + name + "' must be 12 chars or less");

  // todo: check for spaces and other weird chars (as name must form a directory)

  // check for name uniqueness
  for (var serviceId in this.services) {
     if (this.services[serviceId].assigned.name === name)
       throw new Error('Service name ' + name + ' already used. Please choose another name.');
  }

  var assign = {
    id:           this.serviceCount++,
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
 * Use pre-request middleware for rate limiting, message sanitizing etc
 *
 * Works exactly like Express/Connect middleware
 *
 * @param {Function} middleware to execute
 * @return {}
 * @api public
 *  
 */

Server.prototype.use = function(fn) {
  var middleware = fn(this);
  this.middleware.push(middleware);
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
 * Process Incoming Request from WebSocket Transport
 *
 * Examples:
 *
 *    server.process({message: '1|{"method": "callMe"}', socketId: 1234});
 *
 * @param {Object} an object containing the raw message plus info about the sender (socketId, transport, etc)
 * @return {null}
 * @api public
 *  
 */

Server.prototype.process = function(params) {
  var request = new Request(params, this);
  execute(this.middleware, request, function(msg){
    this.api._system.sendError(request.socketId, msg);
    this.log('error', msg, 'for socketId', request.socketId);
  }.bind(this));
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

  // Add main request processor
  this.middleware.push(function(req) {
    req.process();
  });

  if (cb) cb(); // todo: callback when server really starts

  // Return an API object of functions you can call in your server-side code
  return this.api;
};


Server.prototype._registerSystemService = function() {
  this.service('_system', systemService(this));
};


/* Private Helpers */

function execute(stack, request, cb) {
  function exec(req, res, i){
    stack[i].call(stack, req, res, function(){
      exec(req, res, ++i);
    });
  }
  exec(request, cb, 0);
}


function loadPackageJSON() {
  try {
    return JSON.parse(fs.readFileSync(__dirname + '/package.json'));
  } catch (e) {
    throw('Error: Unable to find or parse ss-service package.json file');
  }
}


Server.mockTransport = require('./lib/mock-transport');

module.exports = Server;