"use strict";

/*!
 * Rate Limiter Middleware for SocketStream Realtime Server
 *
 * This very basic rate limiter prevents sockets from flooding the server
 * with multiple requests per second (easy to do on the client if you use a
 * while loop in the JS console).
 *
 * It also serves as an excellent example of how to create Request Middleware
 *
 * Copyright(c) 2013 Owen Barnes <owen@socketstream.org>
 * MIT Licensed
 */


module.exports = function(options) {

  options = options || {};
  options.maxRequestsPerSecond = options.maxRequestsPerSecond || 8;

  var rpsSocketIds = {};
  var warnedSocketIds = {};

  return function(server) {

    // cleanup when socket disconnects
    server.events.on('client:disconnect', function(socketId){
      delete warnedSocketIds[socketId];
    });

    // reset request counters every second
    setInterval(function(){ rpsSocketIds = {}; }, 1000);

    return function(req, res, next) {
      var rps = rpsSocketIds[req.socketId];

      // drop the request if client has exceeded its limit
      if (rps > options.maxRequestsPerSecond) {
        if (!warnedSocketIds[req.socketId]) {
          warnedSocketIds[req.socketId] = true;
          res('Request dropped by rate limiter');
        }
        return;
      } 

      // else increment counter
      if (!rps) rpsSocketIds[req.socketId] = 0;
      rpsSocketIds[req.socketId]++;

      // and pass request through
      next();
    };

  };

};
