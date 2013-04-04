"use strict";

/*

  Pub Sub Service
  ---------------
  Publishes events to all connected clients

*/

require('colors');

module.exports = function(options) {

  var service = {use: {json: true, sessions: true}};

  service.client = require('./client.js');

  service.server = function(server) {

    var publishApi = {

      broadcast: function(){
        var eventName = arguments[0],
            params = 2 <= arguments.length ? Array.prototype.slice.call(arguments, 1) : [],
            msg = {e: eventName, p: params};
        server.log('➙'.cyan, 'event:all'.grey, eventName);
        server.broadcast(msg);
      }

    };

    publishApi.all = publishApi.broadcast;

    return publishApi;

  };

  return service;

};