"use strict";

// Start the HTTP Asset Server
//
// Serves HTML, CSS, client-side JS, images etc

var http = require('http');
var app = require('../config')();
var port = 3000;


// Define a Single Page Client
var view = app.client('views/main.jade', {
  css:  ['css/reset.css', 'css/main.styl'],
  js:   ['libs/jquery.min.js'],
  tmpl: ['tmpl']
}, {baseDir: 'client'});

// Use Jade for HTML
view.engine('jade', require('jade').__express);

// Use Stylus for CSS
view.engine('styl', function(path, options, cb){
  var styl = require('fs').readFileSync(path).toString();
  require('stylus')(styl)
    .set('filename', path)
    .use(require('nib')())
    .render(cb);
});

// Serve it
app.route('/', view);

// Start HTTP Server
var httpServer = http.createServer(app.router()).listen(port, '127.0.0.1');

console.log('- Standalone Asset Server running at http://127.0.0.1:%d', port);