"use strict";

/*!
 * SocketStream 0.4
 * ----------------
 * Copyright(c) 2013 Owen Barnes <owen@socketstream.org>
 * MIT Licensed
 */

var fs = require('fs'),
    path = require('path'),
    EventEmitter = require('events').EventEmitter,
    Server = require('./mods/socketstream-server');


function Application(options){

  var self = this;

  // Set options
  self.options = (options || {});

  // Store things we need to share between modules and external services
  self.clients =        [];
  self.preprocessors =  {};
  self.routes =         {};

  // Set App Root Dir
  self.root = self.options.root ? self.options.root : process.cwd().replace(/\\/g, '/');

  // Set environment
  self.env = (process.env.NODE_ENV || 'development').toLowerCase();

  // Get current version from package.json
  self.version = loadPackageJSON().version;

  // Logger - Allow each level to be overridden with a custom function
  self.log = {
    debug:  function(){},
    info:   function(){},
    error:  console.error
  };

  // System Event Bus - allows apps to respond to system events
  self.eb = new EventEmitter();
  
  var serviceLogger = function() {
    var args = Array.prototype.slice.call(arguments);
    while (args[0].length < 12) args[0] = ' ' + args[0]; // pad
    args[0] = ~args[0].indexOf('error') ? args[0].red : args[0].grey;
    console.log.apply(console, args);
  };

  // Load the Realtime Server
  self.server = new Server({
    root:   self.root,
    dir:    'services',
    log:    serviceLogger,    
    events: self.eb
  });

}

/**
 *
 * Use a Realtime Transport
 *
 * Examples:
 *
 *    ss.transport(require('rtt-engineio')());
 *
 * @param {Object} transport definition object (see Realtime Transport Spec)
 * @param {Object} options and overrides (e.g. don't send client libs)
 * @return {Object} TBD
 * @api public
 * 
 */

Application.prototype.transport = function(spec){
   this.server.transport = spec;
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

  var self = this;

  options = options || {};

  var Client = require('./lib/client');

  // Prepend base directory to all paths
  if(options.baseDir) {
    viewName = path.join(options.baseDir, viewName);
    Object.keys(paths).forEach(function(k) {
      paths[k].forEach(function(p, i) {
        paths[k][i] = path.join(options.baseDir, p);
      });
    });
  }

  var thisClient = new Client(this, viewName, paths, function(){
    return self.server.browserAssets();
  });

  thisClient.baseDir = options.baseDir;
  this.clients.push(thisClient);
  return thisClient;
};

// Create new route for incoming HTTP requests (recursively until we find a matching route)
Application.prototype.route = function(url, clientOrFn){
  if (url[0] != '/') throw new Error('URL must begin with /');
  this.routes[url] = clientOrFn;
};

// Route incoming HTTP requests to Single Page Clients or hand over to asset/file server
Application.prototype.router = function(){
  var handler, self = this;

  if (!self.routes['/']) throw new Error("You must specify a base route: e.g. app.route('/', mainClient)");
  var matchRoute = require('./lib/http/resolve_route');
  function isStatic (req) { return req.url.indexOf('.') >= 0; }

  return function(req, res) {
    if (self.isAssetRequest(req)) return self.serveSystem(req).pipe(res);
    if (isStatic(req)) return self.serveStatic(req, 'client/public').pipe(res);
    // If a route is found, exec function or serve Single Page Client
    var handler;
    if (handler = matchRoute(self.routes, req.url)) {
      typeof handler === 'function' ? handler(req, res) : handler.view(req).pipe(res);
    } else {
      // TODO: Show 404
    }
  };
};

// Define new Code PreProcessor
Application.prototype.preprocessor = function(fileExtension, mod){
  var self = this;
  (typeof fileExtension === 'object' ? fileExtension : [fileExtension]).forEach(function(ext){
    self.preprocessors[ext] = mod;
  });
  return true;
};

// Test if this looks like an asset request
Application.prototype.isAssetRequest = function(request){
  return request.url.substring(0,5) === '/_ss/';
};

// Serve CSS, JS and Static files
Application.prototype.serveAssets = function(req, staticDir){
  if (this.isAssetRequest(req)) {
    return this.serveSystem(req);
  } else {
    return this.serveStatic(req, staticDir);
  }
};

// Serve CSS and JS over HTTP
Application.prototype.serveSystem = function(request){
  return require('./lib/http/asset_server')(this, this.clients, this.preprocessors, request);
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


// Helpers

function loadPackageJSON () {
  try {
    return JSON.parse(fs.readFileSync(__dirname + '/package.json'));
  } catch (e) {
    throw('Error: Unable to find or parse SocketStream\'s package.json file');
  }
}


module.exports = SocketStream;
