"use strict";

// Example of integrating with Express 3
//
// (you'll need to npm install express inside /example_app to try this)

var express = require('express');
var app = express();

var ss = require('../config')();
ss.preprocessor('jade', require('jade-stream')());
ss.preprocessor('styl', require('stylus-stream')());

// Define a Single Page Client
var mainClient = ss.client('views/main.jade', {
  css:  ['css/reset.css', 'css/main.styl'],
  libs: ['libs/jquery.min.js'],
  tmpl: ['tmpl']
}, {baseDir: 'client'});

app.use(express.cookieParser('Helloworld'));
app.use(express.cookieSession({secret: 'Helloworld'}));
app.use(ss.connectMiddleware());

app.get('/', function(req, res){
  mainClient.view(req).pipe(res);
});

app.listen(3000);

console.log('- Express Server running at http://127.0.0.1:3000');
