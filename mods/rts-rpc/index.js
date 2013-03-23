"use strict";

/*

  RPC Responder
  -------------
  Respond to RPC requests

*/

require('colors');

module.exports = function(options) {

  var service = {use: {json: true, callbacks: true}};

  service.client = require('./client.js');

  service.server = function(server) {

    server.log('i'.yellow, 'Looking for RPC data files in', server.service.relativeRoot());
    
    var Request = require('./request')(server, options);
    
    // Process requests via the websocket
    server.onmessage = function(msg, meta, reply) {

      var request = meta;
      request.method = msg.m;
      request.params = msg.p;
      request.receivedAt = Date.now();

      var response = function(err, response) {
        var obj = { p: response };
        if (request.error) obj.e = request.error;
        var timeTaken = Date.now() - request.receivedAt;
        server.log('↩'.green, request.method, ("(" + timeTaken + "ms)").grey);
        reply(obj);
      };
    
      // Output request
      server.log('↪'.cyan, request.method);

      // Process Request
      try {
        return new Request(request, response);
      } catch (e) {
        var message = (request.clientIp === '127.0.0.1') && e.stack || 'See server-side logs';
        var obj = { e: { message: message } };
        server.log('↩'.red, request.method, e.message.red);
        //if (e.stack) app.log.error(e.stack.split("\n").splice(1).join("\n"))
        reply(obj);
      }

    };

    return null; // no server-side API

  };

  return service;
};