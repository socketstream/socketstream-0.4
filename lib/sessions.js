"use strict";

// NOTE: THIS CODE HAS BEEN PULLED OUT OF 0.3 AND DOESN'T DO ANYTHING YET

// Sessions
// --------
// Creates a wrapper around a Connect Session Store object

// Todo think about multiple instances, prototyping more even though you can't use many of the socket methods in HTTP

require('colors');

var util = require('util'),
    connect = require('connect'),
    UniqueSet = require('./utils/unique_set.js').UniqueSet;


// SESSIONS MODULE

var Sessions = function(app) {

  this.app = app;

  // Keep track of which Websocket Socket IDs are attached to which Channel Subscriptions
  this.subscriptions = {
    user:    new UniqueSet(),
    channel: new UniqueSet()
  };

  // Session exists for duration of user agent (e.g. until browser is closed). Override in your app if required
  this.maxAge = null;

  // Can be easily overriden in your app with app.sessions.store = new MyStore;
  this.store = new connect.session.MemoryStore();

};

// Manually create a new session (for running server-side tests, or calling responders from ss-console)
Sessions.prototype.create = function(id) {
  var sessionId = id || connect.utils.uid(24);
  var session = new connect.session.Session({sessionID: sessionId, sessionStore: this.store});
  session.cookie = {maxAge: this.maxAge};
  session.save();
  return session;
};

// Find a session from the Connect Session Store
// Note: Sessions are automatically created by the connect.session()
// middleware when the browser makes a HTTP request
Sessions.prototype.find = function(sessionId, socketId, cb) {

  var self = this;

  self.store.load(sessionId, function(err, session){

    // Create a new session if we don't have this sessionId in memory
    // Note: in production you should be using Redis or another
    // persistent store so this should rarely happen
    if (!session) session = self.create(sessionId);

    // As we don't have a HTTP request fake one so you can call save() as standard
    session.req = {sessionStore: this.store};

    session.socketId = socketId;

    // Append methods to session object
    session.channel = channels(self.app, session, self.subscriptions);

    // Bind username and any channel subscriptions to this socketID on each request
    session._bindToSocket();
      
    cb(session);

  });

};

module.exports = Sessions;



// INDIVIDUAL SESSION
// Extend Connect's Session Prototype with our own methods

connect.session.Session.prototype.setUserId = function(userId, cb) {
  cb = cb || function(){};
  this.userId = userId;
  this._bindToSocket();
  this.save(cb);
};

// When a new session is created, we need to store the websocket ID so we know
// where to dispatch channel messages to
connect.session.Session.prototype._bindToSocket = function() {
  //if (this.userId) this.subscriptions.user.add(session.userId, this.socketId);
  if (this.channels && (this.channels.length > 0)) this.channel._bindToSocket();
};



// Provides an interface allowing you to subscribe or unsubscribe the session to a private channel
var channels = function(app, session, subscriptions){

  return {

    // Init array to store channels this session is subscribed to
    init: function(){
      if (!session.channels) session.channels = [];
    },

    //Lists all the channels the client is currently subscribed to
    list: function(){
      return session.channels || [];
    },

    // Subscribes the client to one or more channels
    subscribe: function(names, cb) {
      this.init();
      forceArray(names).forEach (function(name) {
        // clients can only join a channel once
        if(!~session.channels.indexOf(name)) {
          session.channels.push(name);
          app.log.info('i'.green + ' subscribed sessionId '.grey + session.id + ' to channel '.grey + name);
        }
      });
      this._bindToSocket();
      session.save(cb);
    },
     
    // Unsubscribes the client from one or more channels
    unsubscribe: function(names, cb) {
      this.init();
      forceArray(names).forEach(function (name) {
        var i = session.channels.indexOf(name);
        if (~i) {
          session.channels.splice(i, 1);
          subscriptions.channel.remove(name, session.socketId);
          app.log.info('i'.green + ' unsubscribed sessionId '.grey + session.id + ' from channel '.grey + name);
          session.save(cb);
        }
      });
    },

    // Unsubscribes the client from all channels
    reset: function(cb) {
      this.unsubscribe(this.list(), cb);
    },
    
    _bindToSocket: function() {
      this.init();
      forceArray(session.channels).forEach(function(name){
        subscriptions.channel.add(name, session.socketId);
      });
    }

  };
};


// Helpers

var forceArray = function (input) {
  return (typeof(input) == 'object') ? input.slice() : [input];
};
