"use strict";

/*!
 * SocketStream Realtime Client
 * Copyright(c) 2013 Owen Barnes <owen@socketstream.org>
 * MIT Licensed
 */


/* Don't warn about eval - it's the only way to download */
/* code from the server and run it on the client */
/* jshint evil: true, browser: true, node: true */

/* global unescape, escape */

/**
 * Module dependencies.
 */


var EE = require('events').EventEmitter;
var Service = require('../realtime-service-client');


function SocketStream(options) {
  options = options || {};

  this.services = {};
  this.api = {};
  this.status = new EE();
  this.version = '0.0.1';
  
  this.sessionCookieName = options.sessionCookieName || 'connect.sid';

  this._registerSystemService();
}


/**
 *  Provide details of a service running on the server (saves needing to discover)
 */

SocketStream.prototype.provide = function(params, handler) {
  var service = new Service(this, params);
  this.services[service.id] = service;
  var api = handler(service);
  if (api) {
    // Hide private services if client support JS 1.8.5
    if (Object.defineProperty && service.private) {
      Object.defineProperty(this.api, service.name, {value: api, enumerable: false});
    } else {
      this.api[service.name] = api;  
    }
    return api;
  }
  return null;
};


/**
 *  Discover which services are available and download the client-side
 *  code from the server.
 */

SocketStream.prototype.discover = function(options, cb) {
  this.api._system.discover(options, cb);
};


/**
 *  Process an incoming message string
 */

SocketStream.prototype.processIncomingMessage = function(msg) {
  var msgAry = msg.split('|');
  var serviceId = msgAry.shift();
  var service = this.services[serviceId];
  if (service) {
    service.read(msgAry);
  } else {
    throw('Unable to process incoming message. Service ID ' + serviceId + ' not found');
  }
};


/**
 *  Attempt to connect. When successful, transmit sessionId
 */

SocketStream.prototype.connect = function(transport, cb) {
  var self = this;
  this.connection = transport(this);
  this.status.on('open', function(){
    self.api._system.connect(cb);  
  });
};


/**
 *  Attempt to get session ID from cookie
 */

SocketStream.prototype._getSessionId = function() {
  if (typeof document === 'undefined') return false;
  var c_end, c_start;
  if (document.cookie.length > 0) {
    c_start = document.cookie.indexOf(this.sessionCookieName + "=");
    if (c_start !== -1) {
      c_start = c_start + this.sessionCookieName.length + 1;
      c_end = document.cookie.indexOf(";", c_start);
      if (c_end === -1) c_end = document.cookie.length;
      return unescape(document.cookie.substring(c_start, c_end));
    }
  }
  return false;
};


/**
 *  Set new session ID cookie
 */

SocketStream.prototype._setSessionId = function(value) {
  if (typeof document === 'undefined') return false;
  var exdays = 1;
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value = escape(value) + ((exdays === null) ? "" : "; expires=" + exdate.toUTCString());
  document.cookie = this.sessionCookieName + "=" + c_value;
};


/**
 *  Register the internal system service used to send session ID and discover services
 */

SocketStream.prototype._registerSystemService = function() {
  var self = this;
  this.provide({id: "0", name: "_system", private: true, use: {json: true, callbacks: true}}, function(client){
    
    return {

      // Pass session ID if we have one
      connect: function(cb) {
        client.send({c: 'connect', v: self.version, sessionId: self._getSessionId()}, function(clientInfo){
          self._setSessionId(clientInfo.sessionId);
          cb(null, clientInfo);
        });
      },

      // Download list of available services from the server
      discover: function(options, cb){
        options = options || {};
        client.send({c: 'discover', p: options}, function(reply){

          reply.forEach(function(service){
            var handler;
            eval('handler = ' + service.handler);
            self.provide(service.params, handler);
          });

          cb();

        });
      }
    };
  });
};


module.exports = SocketStream;