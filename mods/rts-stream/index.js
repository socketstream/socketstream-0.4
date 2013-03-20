"use strict";

/*

  Experimental Stream Service Adapter
  -----------------------------------
  Use Node Streams in the browser

  Note: This is implemented using Duplex Streams2 class in Node 0.10 and above
  In the browser we have to use Streams1 until the Browserify2 shim is updated

  TODO: Turn each stream event (e.g. 'data' or 'drain') into an integer and send this
  before the main message. This will allow us to handle backpressure

*/

require('colors');

var Stream = require('stream');

module.exports = function(options) {

  var service = {};

  service.client = require('./client.js');

  service.server = function(server) {

    var s = new Stream.Duplex();

    s._read = function() {
      // resume pushing
    };

    s._write = function(chunk, encoding, cb) {
      server.log('↪'.cyan, 'streaming data to client');
      server.broadcast(chunk);
      cb();
    };

    service.onmessage = function(msg) {
      server.log('↩'.green, 'streaming data from client');
      s.push(msg);
    };

    return s;

  };

  return service;
};
