"use strict";

/*

  Example SocketStream 0.4 Application
  ------------------------------------

  I've separated the asset-serving and realtime elements of SocketStream
  so each can be scaled-up separately to meet demand.

  When 0.4 is fully released the example app generated will contain everything
  in one file. For now I'm isolating frontend and backend to aid development.

*/


var spawn = require('child_process').spawn,

    // Standalone Asset Server
    assetServer = spawn('node', ['scripts/asset_server']),

    // Express-based Asset Server
    //expressServer = spawn('node', ['scripts/express_example']),

    // The Realtime (Websocket Server) which runs on a different port
    realtimeServer = spawn('node', ['scripts/realtime_server']);


// EITHER start the Standalone Asset server OR the Express Server
console.log('Starting Asset Server...');
startServer(assetServer);
//startServer(expressServer);

// Always Start the Realtime/Websocket Server
console.log('Starting Realtime Server...');
startServer(realtimeServer);


function startServer(childProcess) {
  childProcess.stdin.end();
  childProcess.stderr.pipe(process.stderr);
  childProcess.stdout.pipe(process.stdout);
}