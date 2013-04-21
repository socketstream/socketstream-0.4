"use strict";

/*

  Example SocketStream 0.4 Application
  ------------------------------------

  I've separated the asset-serving and realtime elements of SocketStream
  so each can be scaled-up separately to meet demand.

  When 0.4 is fully released the example app generated will contain everything
  in one file. For now I'm isolating frontend and backend to aid development.

*/


var spawn = require('child_process').spawn;

function start(childProcess) {
  childProcess.stdin.end();
  childProcess.stderr.pipe(process.stderr);
  childProcess.stdout.pipe(process.stdout);
}


// Choose between a standalone asset server or Express-based server
var assetServer = spawn('node', ['scripts/asset_server']);
//var assetServer = spawn('node', ['scripts/express_example']);

// The Realtime (Websocket Server) which runs on a different port
var realtimeServer = spawn('node', ['scripts/realtime_server']);

// Start the asset server
console.log('Starting Asset Server...');
start(assetServer);

// Always Start the Realtime/Websocket Server
console.log('Starting Realtime Server...');
start(realtimeServer);

