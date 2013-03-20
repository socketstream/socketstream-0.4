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
  app.transport(require('ss-engineio2')({port: 3001}));

  // Define Realtime Services to run over the websocket
  app.service('livereload', require('rts-livereload')());
  app.service('pubsub', require('rts-pubsub')());
  app.service('rpc', require('rts-rpc')());
  app.service('tweetStream', require('rts-stream')());

  // Realtime Services are *just* objects, so you can easily define your own
  app.service('square', {

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

  return app;

};