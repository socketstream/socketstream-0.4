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

  // Define Services to run over the websocket
  app.service('livereload', require('ss-livereload')({dirs: '/client'}));
  app.service('pubsub', require('ss-pubsub')());
  app.service('rpc', require('ss-rpc')({root: './server/rpc'}));
  app.service('tweetStream', require('ss-stream')());

  return app;

};