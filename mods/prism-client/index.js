"use strict";

/*!
 * Prism Realtime Client
 * Copyright(c) 2013 Owen Barnes <owen@socketstream.org>
 * MIT Licensed
 */

/* jshint browser: true, node: true */
/* global unescape, escape */

/**
 * Module dependencies.
 */


var EE = require('events').EventEmitter;
var Service = require('realtime-service-client');
var systemService = require('./lib/system-service');


/**
 * Prism Client
 *
 * Example:
 *
 *     var prism = require('prism-client');
 *     var client = prism({
 *       root:          '/my/app/dir',
 *       dir:           'services',
 *       log:           console.log,
 *       transport:     require('rtt-engineio')(),
 *       events:        instanceOfAnEventEmitter,
 *       sessionStore:  new RedisStore({port: 6379}),
 *       cacheSessions: true
 *     });
 * 
 * @param {Object} options
 * @return {Object} instance of ServiceManager
 * @api public
 *  
 */

function Client(options) {
  options = options || {};

  this.services = {};
  this.api = {};
  this.status = new EE();
  this.version = '0.0.1';

  this.transport = options.transport || null;
  this.sessionCookieName = options.sessionCookieName || 'connect.sid';

  this._registerSystemService();
}


/**
 *  Provide details of a service running on the server (saves needing to discover)
 */

Client.prototype.provide = function(params, handler) {
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
 *  Load all services in from an Array (used when testing on the server)
 */

Client.prototype.load = function(services) {
  services.forEach(function(service){
    this.provide(service.paramsForClient(), service.clientApi);   
  }.bind(this));
};


/**
 *  Discover which services are available and download the client-side code from the server.
 */

Client.prototype.discover = function(options, cb) {
  this.api._system.discover(options, cb);
};


/**
 *  Process an incoming message string
 */

Client.prototype.process = function(req) {
  var msgAry = req.message.split('|');
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

Client.prototype.connect = function(cb) {
  this.status.on('open', function(){
    this.api._system.connect(cb);  
  }.bind(this));
  this.connection = this.transport(this);
};


/**
 *  Attempt to get session ID from cookie
 */

Client.prototype._getSessionId = function() {
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


Client.prototype._registerSystemService = function() {
  systemService(this);
};


/**
 *  Set new session ID cookie
 */

Client.prototype._setSessionId = function(value) {
  if (typeof document === 'undefined') return false;
  var exdays = 1;
  var exdate = new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value = escape(value) + ((exdays === null) ? "" : "; expires=" + exdate.toUTCString());
  document.cookie = this.sessionCookieName + "=" + c_value;
};


module.exports = function(options){
  return new Client(options);
};