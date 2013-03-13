"use strict";

/*

  RPC Responder
  -------------
  Respond to RPC requests

*/

require('colors');

module.exports = function(options) {

  options = options || {};
  options.name = options.name || 'rpc';
  options.root = options.root || '/server/rpc';

  return function(service){

    service.config = {json: true, callbacks: true};

    service.sendClientCode(__dirname + '/client.js');

    service.start = function() {
      
      var Request = require('./request')(service, options);
      
      // Process requests via the websocket
      service.onmessage = function(msg, meta, reply) {

        var request = {
          id:           meta._callbackId,
          method:       msg.m,
          params:       msg.p,
          socketId:     meta.socketId,
          clientIp:     '127.0.0.1',//meta.clientIp,
          //sessionId:  meta.sessionId,
          //transport:  meta.transport,
          receivedAt:   Date.now()
        };

        var response = function(err, response) {
          var obj = { p: response };
          if (request.error) obj.e = request.error;
          var timeTaken = Date.now() - request.receivedAt;
          service.log('↩'.green, request.method, ("(" + timeTaken + "ms)").grey);
          reply(obj);
        };
      
        // Output request
        service.log('↪'.cyan, request.method);

        // Process Request
        try {
          return new Request(request, response);
        } catch (e) {
          var message = (request.clientIp === '127.0.0.1') && e.stack || 'See server-side logs';
          var obj = { e: { message: message } };
          service.log('↩'.red, request.method, e.message.red);
          //if (e.stack) app.log.error(e.stack.split("\n").splice(1).join("\n"))
          reply(obj);
        }

      };

      return null; // no server API

    };

  };
};