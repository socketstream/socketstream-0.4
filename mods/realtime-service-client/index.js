"use strict";

/*!
 * Realtime Service - Client
 * Copyright(c) 2013 Owen Barnes <owen@socketstream.org>
 * MIT Licensed
 */

function Service(services, params) {
  this.services = services;

  this.id = params.id;
  this.name = params.name;
  this.use = params.use || {};
  this.options = params.options || {};
  this.private = params.private || false;

  // for optional callbacks
  this.cbCount = 0;
  this.cbStack = {};

  this.msgAttrs = [];
  if (this.use.callbacks) this.msgAttrs.push('callbackId');
}

Service.prototype.read = function(msgAry) {
  var attrs = {}, cb = null;

  // Parse message attributes  
  if (this.msgAttrs.length > 0) {
    for (var i = 0; i < this.msgAttrs.length; i++) {
      attrs[this.msgAttrs[i]] = msgAry.shift();
    }
  }

  // Get message content
  var msg = msgAry.join('|');

  // Try to fetch Callback ID
  var cbId = Number(attrs.callbackId);
  if (cbId) cb = this.cbStack[cbId];

  // Decode to object
  if (this.use.json) msg = JSON.parse(msg);

  // Fire callback or pass to generic onmessage handler
  (cb || this.onmessage)(msg);

  // Clean up and callback
  if (cbId) delete this.cbStack[cbId];
};

Service.prototype.send = function(msg, cb) {
  var msgAry = [this.id];

  // Encode to JSON
  if (this.use.json) msg = JSON.stringify(msg);

  // Optionally add callback to stack
  if (this.use.callbacks) {
    var cbId = ++this.cbCount;
    this.cbStack[cbId] = cb;
    msgAry.push(cbId);
  }

  // Assemble final message
  msgAry.push(msg);
  msg = msgAry.join('|');

  this.services.connection.write(msg);
};

/**
 * Browser-friendly debug (won't break in old IE)
 */

Service.prototype.debug = function() {
  var args = Array.prototype.slice.call(arguments);
  args.unshift('DEBUG ' + this.name + ':');
  if (this.options.debug) {
    if (window.console && console.log)
      Function.prototype.apply.call(console.log, console, args);
  }
};

module.exports = Service;