"use strict";

/*!
 * SocketStream 0.4 Framework
 * --------------------------
 * Copyright(c) 2013 Owen Barnes <owen@socketstream.org>
 * MIT Licensed
 */

var fs = require('fs'),
    path = require('path'),
    EventEmitter = require('events').EventEmitter,
    prism = require('prism'),
    SinglePageApp = require('./mods/spa'),
    Router = require('./mods/pushstate-router');


function Application(options){

  var self = this;

  // Set options
  self.options = options || {};

  // Store things we need to share between modules and external services
  self.clients =        [];
  self.preprocessors =  {};

  // Set App Root Dir
  self.root = self.options.root || process.cwd().replace(/\\/g, '/');

  // Set environment
  self.env = (process.env.NODE_ENV || 'development').toLowerCase();

  // Get current version from package.json
  self.version = require('./package.json').version;

  // Logger - Allow each level to be overridden with a custom function
  self.log = {
    debug:  function(){},
    info:   function(){},
    error:  console.error
  };

  // System Event Bus - allows your app to respond to system events
  self.eb = new EventEmitter();
  
  // Pass a fancy logger to the Realtime Server
  var serviceLogger = function() {
    var args = Array.prototype.slice.call(arguments);
    while (args[0].length < 12) args[0] = ' ' + args[0]; // pad
    args[0] = ~args[0].indexOf('error') ? args[0].red : args[0].grey;
    console.log.apply(console, args);
  };

  // Load the Realtime Server
  self._server = prism({
    root:   self.root,
    dir:    'services',
    log:    serviceLogger,    
    events: self.eb
  });

  self._router = new Router();

}

/**
 *
 * Use a Realtime Transport
 *
 * Examples:
 *
 *    app.transport(require('rtt-engineio')());
 *
 * @param {Object} transport definition object (see Realtime Transport Spec)
 * @param {Object} options and overrides (e.g. don't send client libs)
 * @return {Object} TBD
 * @api public
 * 
 */

Application.prototype.transport = function(spec){
  this._server.transport = spec;
};


/**
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

Application.prototype.service = function(name, definition, options) {
  return this._server.service(name, definition, options);
};

/**
 * Use pre-request middleware for rate limiting, message sanitizing etc
 *
 * Works exactly like Express/Connect middleware
 *
 * Examples:
 *
 *     app.use(require('ss-rate-limiter'));
 *
 * @param {Function} middleware to execute
 * @return {}
 * @api public
 *  
 */

Application.prototype.use = function(fn){
  return this._server.use(fn);
};


/**
 * Start Server
 *
 * Examples:
 *
 *    app.start()
 *
 * @param {Function} Callback to execute once server has started
 * @return {Object} Server-side API
 * @api public
 *  
 */

Application.prototype.start = function(cb){
  // Write auto-generated system client file
  var clientConfig = this._server.buildClient();
  fs.writeFileSync(this.root + '/client/app/client.js', clientConfig);
  
  // Start server
  return this._server.start(cb);
};



// Provide an adapter so SocketStream can be plugged into Connect or Express
Application.prototype.connectMiddleware = function(options){
  var self = this;

  return function(req, res, next) {
    if (req.url === '/') {
      next();
    } else {
      self.serveAssets(req, 'client/public').pipe(res);
    }

  };
};


// Define new Single Page Client
Application.prototype.client = function(viewName, paths, options){
  options = options || {};
  options.root = this.root;

  // Merge assets from Realtime Transport and Realtime Services into paths
  var browserAssets = this._server.browserAssets();

  var client = new SinglePageApp(viewName, paths, options);

  client.addAsset('js', {filename: '/__modules.js'});

  browserAssets.forEach(function(asset){
    client.addAsset(asset.type, asset, {atTop: true});
  });

  this.clients.push(client);

  // Serve source files in dev mode
  this._router.route('/_dev', client.middleware);

  return client;
};

// Create new route for incoming HTTP requests (recursively until we find a matching route)
Application.prototype.route = function(url, fn){
  this._router.route(url, fn);
};

// Route incoming HTTP requests to Single Page Clients or hand over to asset/file server
Application.prototype.router = function(){
  var handler, self = this;

  if (!self._router.routes['/']) throw new Error("You must specify a base route: e.g. app.route('/', mainClient)");
  
  function isStatic (req) { 
    if (req.url.substring(0,6) === '/_dev/') return false;
    return req.url.indexOf('.') >= 0;
  }

  return function(req, res) {
    if (isStatic(req)) return self.serveStatic(req, 'client/public').pipe(res);

    // If a route is found, exec function or serve Single Page Client
    var handler = self._router.resolve(req.url);
    if (handler) {
      handler(req, res);
    } else {
      console.log(req.url)
      res.end("404");
    }
  };
};


// Serve static assets (e.g. images) over HTTP
Application.prototype.serveStatic = function(request, dir){
  var fileName = path.join(this.root, dir, request.url);
  return require('filed')(fileName);
};


// Create a new instance
var SocketStream = function(options){
  return new Application(options);
};


module.exports = SocketStream;
