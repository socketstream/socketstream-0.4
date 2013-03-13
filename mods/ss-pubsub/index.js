"use strict";

/*

  Pub Sub Service
  ---------------
  Publishes events to all connected clients

*/

require('colors');

module.exports = function(options) {

  return function(service){

    service.config.json = true;

    service.sendClientCode(__dirname + '/client.js');

    service.start = function() {

      var serverAPI = {};

      // Broadcast event to everyone
      serverAPI.all = function(){
        var eventName = arguments[0],
            params = 2 <= arguments.length ? Array.prototype.slice.call(arguments, 1) : [],
            msg = {e: eventName, p: params};
        service.log('➙'.cyan, 'event:all'.grey, eventName);
        service.broadcast(msg);
      };

      return serverAPI;

    };

  };
};