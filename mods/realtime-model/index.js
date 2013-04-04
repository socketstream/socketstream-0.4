"use strict";

/**
 *  Realtime Models
 */

var EventEmitter = require('events').EventEmitter;
var pubsub = require('./redis')();


function Models (options) {
  options = options || {};
  this.idAttribute = options.idAttribute || 'id';

  this.models = {};
  this.events = new EventEmitter();

  this._listen();
}

Models.prototype.create = function(name, actions) {
  if (this.models[name]) throw new Error('Model ' + name + ' already defined');
  this.models[name] = new Model(name, actions);
  return this.models[name];
};

// Tell each model to stop reporting changes for this clientId
Models.prototype.unwatch = function(clientId) {
  for (var name in this.models) {
    this.models[name].unwatch(clientId);
  }
};

// Listen for change events over pubsub (e.g. Redis)
Models.prototype._listen = function(clientId) {
  var self = this;
  pubsub.subscribe.on('event', function(msg){

    // try to find matching model
    var model = self.models[msg.m];
    if (!model) return;

    // try to get client ids
    var clientIds = model.watchers(msg.id);
    if (!clientIds) return;

    self.events.emit('event', clientIds, msg);
  });
};




function Model (name, actions) {
  if (!name) throw new Error("Model must have a name");
  if (typeof actions !== 'object') throw new Error("Actions must be provided as a object");
  this.name = name;
  this.actions = actions;
  this.watched = {};
}

Model.prototype.watch = function(recordId, clientId) {
  recordId = String(recordId);
  if (!this.watched[recordId]) this.watched[recordId] = [];
  if (this.watched[recordId].indexOf(clientId) === -1) {
    this.watched[recordId].push(clientId);
  }
  console.log('watched is now', this.watched)
};

Model.prototype.unwatch = function(clientId) {
  for (var recordId in this.watched) {
    var i = this.watched[recordId].indexOf(clientId);
    if (i >= 0) this.watched[recordId].splice(i, 1);
  }
};

Model.prototype.watchers = function(recordId) {
  recordId = String(recordId);
  return this.watched[recordId];
};

Model.prototype.api = function(clientId) {
  var self = this;
  return {
    update: function(id, data) {
      pubsub.publish('update', {m: self.name, a: 'R', id: id, d: data});
    }
  };

};


Model.prototype.execute = function(actionName, params, meta, app, clientId, cb) {
  var self = this;
  // look for this action
  var action = this.actions[actionName];

  if (!action) return cb(new Error('Action not found'));

  action(params, meta, app, function(err, response){
    
    // pass through errors
    if (err) return cb(err);

    // intercept responses to track which clients get which records
    if (response.length) {
      try {
        response.forEach(function(record){
          self.watch(record.id, clientId);
        });
      } catch (e) {}
      return cb(null, response);
    } else {
      self.watch(response.id, clientId);
      return cb(null, response);
    }

  }, this.api(clientId));

};

module.exports = function(options){
  var models = new Models(options);
  return models;
};