'use strict'

/*

   SocketStream 0.4 (Experimental!)
   --------------------------------
   Keep track of Single Page Clients and allow actions to be performed on them all

*/

var fs = require('fs'),
    path = require('path'),
    EventEmitter = require('events').EventEmitter,
    ClientCode = require('./lib/client/code'),
    Switchboard = require('./lib/switchboard')


function Application(options){

  var self = this

  // Set options
  self.options = (options || {})

  // Store things we need to share between modules and external services
  self.clients =        []
  self.preprocessors =  {}
  self.routes =         {}
  self.services =       {}

  // Set App Root Dir
  self.root = self.options.root ? self.options.root : process.cwd().replace(/\\/g, '/')

  // Set environment
  self.env = (process.env['NODE_ENV'] || 'development').toLowerCase()

  // Get current version from package.json
  self.version = loadPackageJSON().version

  // Logger - Allow each level to be overridden with a custom function
  self.log = {
    debug:  function(){},
    info:   function(){},
    error:  console.error
  };

  // Code to be sent to all clients
  self.clients.code = new ClientCode

  // Message Switchboard (handles one to many WS/stream relationships)
  self.switchboard = new Switchboard

  // Load System Defaults
  require('./lib/load_defaults')(self)

  // System Event Bus - allows apps to respond to system events
  self.eb = new EventEmitter

}

// Setup Websocket Transport
Application.prototype.transport = function(mod, options){
  this._transport = mod(this, this.switchboard)
  return this._transport
}

// Use new SocketStream Websocket Service
Application.prototype.service = function(service, options){
  options = options || {}
  var self = this

  if (typeof service == 'string') service = require('./lib/services/' + service)(self, options)
  var serverStream = self.switchboard.createService()

  // Allow services to be exposed (to be shared between other services)
  serverStream.expose = function(name, fn) {
    self.services[name] = fn
  }

  // By default we send client code to all clients. Alternatively pass an array of clients
  if (service.client) {
    var clients = options.clients || [self.clients]
    clients.forEach(function(client){
      client.code.sendCode("require('socketstream')().registerService(" + serverStream.id + ", " + service.client.toString() + ");")
    })
  }

  // Return any server-side API
  return service.server(serverStream)
}

// Define new Single Page Client
Application.prototype.client = function(viewName, paths, baseDir){
  var client = require('./lib/client');
  if(baseDir) {
    viewName = path.join(baseDir, viewName);
    Object.keys(paths).forEach(function(k) {
      paths[k].forEach(function(p) {
        paths[k][p] = path.join(baseDir, paths[k][p]);
      })
    })
  }
  var thisClient = new client(this, viewName, paths, baseDir);
  thisClient.baseDir = baseDir;
  this.clients.push(thisClient);
  return thisClient;
}

// Create new route for incoming HTTP requests (recursively until we find a matching route)
Application.prototype.route = function(url, clientOrFn){
  if (url[0] != '/') throw new Error('URL must begin with /')
  this.routes[url] = clientOrFn
}

// Route incoming HTTP requests to Single Page Clients or hand over to asset/file server
Application.prototype.router = function(){
  var handler, self = this

  if (!self.routes['/']) throw new Error("You must specify a base route: e.g. app.route('/', mainClient)")
  var matchRoute = require('./lib/http/resolve_route')
  function isStatic (req) { return req.url.indexOf('.') >= 0 }

  return function(req, res) {
    if (self.isAssetRequest(req)) return self.serveSystem(req).pipe(res)
    if (isStatic(req)) return self.serveStatic(req, 'client/public').pipe(res)
    // If a route is found, exec function or serve Single Page Client
    var handler;
    if (handler = matchRoute(self.routes, req.url)) {
      typeof handler === 'function' ? handler(req, res) : handler.view(req).pipe(res)
    } else {
      // TODO: Show 404
    }
  }
}

// Define new Code PreProcessor
Application.prototype.preprocessor = function(fileExtension, mod){
  var self = this;
  (typeof fileExtension === 'object' ? fileExtension : [fileExtension]).forEach(function(ext){
    self.preprocessors[ext] = mod;
  })
  return true
}

// Test if this looks like an asset request
Application.prototype.isAssetRequest = function(request){
  return request.url.substring(0,5) === '/_ss/'
}

// Serve CSS, JS and Static files
Application.prototype.serveAssets = function(req, staticDir){
  if (this.isAssetRequest(req)) {
    return this.serveSystem(req)
  } else {
    return this.serveStatic(req, staticDir)
  }
}

// Serve CSS and JS over HTTP
Application.prototype.serveSystem = function(request){
  return require('./lib/http/asset_server')(this.root, this.clients, this.preprocessors, request)
}

// Serve static assets (e.g. images) over HTTP
Application.prototype.serveStatic = function(request, dir){
  return require('filed')(path.join(this.root, dir, request.url))
}

// Start listening for Websocket Messages
// Pass the httpServer so the transport can bind to it
Application.prototype.start = function(httpServer, cb) {
  if (!this._transport) { throw new Error('The app.start() command can only be called once the Websocket Transport has been defined. Set with app.transport()')}
  this.sockets = this._transport(httpServer)
  httpServer.on('listening', function() {
    if(cb)
      cb(httpServer.address().port)
    if(process.send)
      process.send({'SOCKETSTREAM_PORT': httpServer.address().port})
  });
}

// Create a new instance
var SocketStream = function(options){
  return new Application(options)
}


// Helpers

function loadPackageJSON () {
  try {
    return JSON.parse(fs.readFileSync(__dirname + '/package.json'));
  } catch (e) {
    throw('Error: Unable to find or parse SocketStream\'s package.json file');
  };
};


module.exports = SocketStream
