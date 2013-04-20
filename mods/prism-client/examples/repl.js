"use strict";

/**
 * Example of connecting to a remote Prism server and querying it with a REPL
 * Note: The Realtime Transport MUST be the same as used on the server and must
 * support Node. rtt-ws and rtt-engineio do. rtt-sockjs does not.
 **/

var repl = require('repl');
var prismClient = require('../');
var rtt = require('rtt-engine.io')();

var transport = rtt.client({port: 3001, host: 'localhost', debug: false});
var app = prismClient({transport: transport});

app.connect(function(err, info){

  console.log("Connected to Prism Server %s with Session ID %s", info.version, info.sessionId);
  
  app.discover({}, function(){
    console.log("Type `api` to see which services are available");
    var r = repl.start({prompt: 'Prism > '});
    r.context.api = app.api;
  });

});