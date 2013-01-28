'use strict'

// Example SocketStream 0.4 Application
// Note: API is subject to change at this stage

var http = require('http'),
    path = require('path'),
    SocketStream = require('../socketstream'),
    app = SocketStream()

// Log to console
app.log.debug = console.log

// Support Jade
app.preprocessor('jade', require('./jade-stream')())
app.preprocessor('styl', require('./stylus-stream')())

// Setup Websocket Transport
app.transport(require('./ss-engineio'))

// Define a Single Page Client
var mainClient = app.client('client/views/main.jade', {
  css:  ['client/css/reset.css', 'client/css/main.styl'],
  mods: ['client/app'],
  libs: ['client/libs/jquery.min.js'],
  tmpl: ['client/tmpl']
}, __dirname)

// Serve it
app.route('/', mainClient)

// Define Services to run over the websocket
app.service('rpc', {root: '/server/rpc'})
app.service('liveReload', {dirs: '/client'})
app.service('pubsub')

// Start HTTP Server
var httpServer = http.createServer(app.router()).listen(3000, '127.0.0.1')

// Long way of doing the same thing:
// var server = http.createServer(function (req, res) {

//   if (req.url === '/') {
//     mainClient.view(req).pipe(res)
//   } else if (app.isAssetRequest(req)) {
//     app.serveAssets(req).pipe(res)
//   } else {
//     app.serveStatic(req, 'client/public').pipe(res)
//   }

// }).listen(3000, '127.0.0.1')

// Start listening over the websocket
var ss = app.start(httpServer, function(){
  console.log('Server running at http://127.0.0.1:3000');  
})

