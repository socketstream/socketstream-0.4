"use strict";

// Start the Realtime (Websocket) Server
//
// Processes incoming commands over the websocket

var app = require('../config')();

// Start listening over the websocket
var ss = app.server.start(function(){
  console.log('- Realtime Server running at http://127.0.0.1:3001');  
});

// Example of a Fake Tweet Stream piping data to all clients every five seconds
// Be sure to uncomment app.service('tweetStream', require('rts-stream')()); in /config.js to try this
// var tweetStream = require('./fake_tweet_stream')(5);
// tweetStream.pipe(ss.tweetStream);