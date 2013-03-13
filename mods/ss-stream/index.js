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

  return function(service) {

    service.sendClientCode(__dirname + '/client.js');

    service.start = function() {

      var s = new Stream.Duplex();

      s._read = function() {
        // resume pushing
      };

      s._write = function(chunk, encoding, cb) {
        service.log('↪'.cyan, 'streaming data to client');
        service.broadcast(chunk);
        cb();
      };

      service.onmessage = function(msg) {
        service.log('↩'.green, 'streaming data from client');
        s.push(msg);
      };

      return s;

    };

  };
};
