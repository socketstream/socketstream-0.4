var express = require('express');
var SPA = require('../');

var app = express();

var client = new SPA('index.html', {
  css: ['reset.css', 'app.styl'],
  js:  ['//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js', 'hello.js']
}, {baseDir: 'assets'});


client.engine('jade', require('jade').__express);

client.engine('styl', function(path, options, cb){
  var styl = require('fs').readFileSync(path).toString();
  require('stylus').render(styl, {filename: path}, cb);
});


// Serve the view live in Express
app.get('/', client);

// Serve any asset requets (CSS, JS, etc)
app.use(client.middleware);


app.listen(3000);



// // Stream to process.stdout

// Build to one minified HTML, JS and CSS file
client.build();