"use strict";

/**
 * Example of connecting to a remote SocketStream server and querying it with a REPL
 * Note: The Realtime Transport must be the same as used on the server and must
 * support Node. rtt-ws and rtt-engineio do. rtt-sockjs does not.
 **/

var repl = require('repl');
var Client = require('../index');
var engineio = require('../../rtt-engineio')();

var transport = engineio.client({port: 3001, host: 'localhost', debug: false});
var app = new Client({transport: transport});

app.connect(function(err, info){

  console.log("Connected to SocketStream Server %s with Session ID %s", info.version, info.sessionId);
  
  app.discover({}, function(){
    console.log("Type `ss` to see which services are available");
    var r = repl.start({prompt: 'SocketStream > '});
    r.context.ss = app.api;
  });

});