"use strict";

/**
 * Example of connecting to a remote SocketStream server and querying it with a REPL
 * Note: The Realtime Transport you use must support this. Engine.IO does, SockJS doesn't.
 **/

var repl = require('repl');
var SSClient = require('../index');
var RTT = require('../../rtt-engineio')();

var transport = RTT.client({port: 3001, host: 'localhost', debug: false});
var client = new SSClient();

client.connect(transport, function(err, info){

  console.log("Connected to SocketStream Server %s with Session ID %s", info.version, info.sessionId);
  
  client.discover({}, function(){
    console.log("Type `ss` to see which services are available");
    var r = repl.start({prompt: 'SocketStream > '});
    r.context.ss = client.api;
  });

});