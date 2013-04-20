/*

  Since both the Asset Server and Realtime Server need to know about the
  websocket Transport and Services (so client-side code can be sent and
  wired up), this config must be shared

*/

var SocketStream = require('../');

module.exports = function(){

  var app = SocketStream({port: 3001});

  // Log to console
  app.log.debug = console.log;

  // Select a Realtime (WebSocket) Transport
  app.transport(require('rtt-engine.io')());
  //app.transport(require('rtt-sockjs')());
  //app.transport(require('rtt-ws')());

  // Define Realtime Services to run over the websocket
  app.service('livereload', require('rts-livereload')());
  app.service('pubsub', require('../mods/rts-pubsub')());
  app.service('rpc', require('../mods/rts-rpc')());
 
  // Example Stream Service (requires Node 0.10 so disabled by default)
  //server.service('tweetStream', require('rts-stream')());

  // Realtime Services are *just* objects, so you can easily define your own
  app.service('square', {

    use: {callbacks: true},

    client: function(client){

      // invoke this function with ss.square() on the client
      return function(question) {
        client.send(question, function(answer){
          console.log(answer);
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
  app.use(require('prism-rate-limiter')());

  return app;

};