/*

  Since both the Asset Server and Realtime Server need to know about the
  websocket Transport and Services (so client-side code can be sent and
  wired up), this config must be shared

*/

var SocketStream = require('../socketstream')();

module.exports = function(){

  var app = SocketStream;

  // Log to console
  app.log.debug = console.log;

  // Setup Websocket Transport
  //app.transport(require('rtt-engineio')({port: 3001}));
  //app.transport(require('rtt-sockjs')({port: 3001}));
  app.transport(require('rtt-ws')({port: 3001}));

  // Define Realtime Services to run over the websocket
  app.server.service('livereload', require('rts-livereload')());
  app.server.service('pubsub', require('rts-pubsub')());
  app.server.service('rpc', require('rts-rpc')());
 
  // Example Stream Service (requires Node 0.10 so disabled by default)
  //server.service('tweetStream', require('rts-stream')());

  // Realtime Services are *just* objects, so you can easily define your own
  app.server.service('square', {

    use: {callbacks: true},

    client: function(client){

      // invoke this function with ss.square() on the client
      return function(question) {
        client.send(question, function(answer){
          alert(answer);
        });
      };

    }, 

    server: function(server) {

      server.onmessage = function(msg, meta, reply) {
        server.log("We are going to square a number: ", msg);
        reply('The answer is ' + (msg * msg));
      };

      server.log("I'm starting up!");
    }

  });
  
  // Use Rate Limiting Middleware
  // (to prevent one client from flooding the server with requests)
  app.server.use(require('ss-rate-limiter')());

  return app;

};