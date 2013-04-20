// SocketStream 0.4 Entry file

var SocketStream = require('./client');

var app = SocketStream();

app.connect(function(err, info) {

  console.log('Connected to the server!', info);

  // Aliases to aid development
  window.app = app;
  window.ss = app.api;

  // Load your first app module
  require('./app');

});

