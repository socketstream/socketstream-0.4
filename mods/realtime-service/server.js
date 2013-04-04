/*!
 * Realtime Service - Server API
 * Copyright(c) 2013 Owen Barnes <owen@socketstream.org>
 * MIT Licensed
 */

function Server(service, transport) {
  this.service = service;
  this.transport = transport;
  this.events = service.assigned.events;
}

Server.prototype.read = function(msg, meta, attrs) {
  var self = this; 

  // Try to fetch Callback ID
  var cbId = Number(attrs.callbackId);
  if (cbId) meta._callbackId = cbId;

  if (this.service.use.json) msg = JSON.parse(msg);

  this.onmessage(msg, meta, function(msg){
    self.sendToSocketId(meta.socketId, msg, {callbackId: cbId});
  });
};

Server.prototype.sendToSocketIds = function(socketIds, msg, attrs) {
  msg = this._prepareOutgoingMessage(msg, attrs);
  if (typeof socketIds !== 'object') socketIds = [socketIds];
  socketIds.forEach(function(socketId) {
    this.transport.sendToSocketId(socketId, msg);
  }, this);
};

// Alias
Server.prototype.sendToSocketId = Server.prototype.sendToSocketIds;

Server.prototype.broadcast = function(msg) {
  msg = this._prepareOutgoingMessage(msg);
  this.transport.broadcast(msg);
};

Server.prototype.log = function(){
  var args = Array.prototype.slice.call(arguments);
  this.service.log.call(this.service, args);
};

Server.prototype.debug = function(){
  if (!this.service.assigned.options.debug) return;
  var args = Array.prototype.slice.call(arguments);
  args.unshift('DEBUG');
  this.service.log.call(this.service, args);
};



/* Private methods */

Server.prototype._prepareOutgoingMessage = function(msg, attrs) {
  if (this.service.use.json) msg = JSON.stringify(msg);

  var buf = [this.service.assigned.id];
  
  // Encode attributes into message if they exist
  if (this.service.msgAttrs.length > 0) {
    this.service.msgAttrs.map(function(attrName){
      buf.push(attrs && attrs[attrName] || '');
    });
  }

  buf.push(msg);

  return buf.join('|');
};


module.exports = Server;