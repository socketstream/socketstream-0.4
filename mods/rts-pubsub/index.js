"use strict";

/*!
 * PubSub Service
 * --------------
 * Allow the server to publish to an event emitter on the client
 *
 * Copyright(c) 2013 Owen Barnes <owen@socketstream.org>
 * MIT Licensed
 */

require('colors');

module.exports = function(options) {

  var service = {use: {json: true, sessions: true}};

  service.client = require('./client.js');

  service.server = function(server) {

    var api = {

      broadcast: function(){
        var eventName = arguments[0],
            params = 2 <= arguments.length ? Array.prototype.slice.call(arguments, 1) : [],
            msg = {e: eventName, p: params};
        server.log('➙'.cyan, 'event:all'.grey, eventName);
        server.broadcast(msg);
      },

      /* CHANNELS */

      subscribe: function(session, channelNames, cb) {
        if (!session.channels) session.channels = [];
        forceArray(channelNames).forEach(function(name) {
          // clients can only join a channel once
          if(!~session.channels.indexOf(name)) {
            session.channels.push(name);
            server.log('i'.green + ' subscribed sessionId '.grey + session.id + ' to channel '.grey + name);
          }
        });
        //this._bindToSocket();
        session.save(cb);
      }

    };

    api.all = api.broadcast;

    return api;

  };

  return service;

};


function forceArray(input) {
  return (typeof(input) == 'object') ? input.slice() : [input];
}