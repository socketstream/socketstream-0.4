"use strict";

// Start the HTTP Asset Server
//
// Serves HTML, CSS, client-side JS, images etc

var http = require('http'),
    app = require('../config')();

// Support Jade
app.preprocessor('jade', require('jade-stream')());
app.preprocessor('styl', require('stylus-stream')());

// Define a Single Page Client
var mainClient = app.client('views/main.jade', {
  css:  ['css/reset.css', 'css/main.styl'],
  libs: ['libs/jquery.min.js'],
  tmpl: ['tmpl']
}, {baseDir: 'client'});

// Serve it
app.route('/', mainClient);

// Start HTTP Server
var httpServer = http.createServer(app.router()).listen(3000, '127.0.0.1');

console.log('- Standalone Asset Server running at http://127.0.0.1:3000');