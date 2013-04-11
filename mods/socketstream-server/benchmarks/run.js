"use strict";

/*

  SocketStream Server - Micro Benchmark Suite

  To run this you'll need to install all dev dependencies

*/

require('colors');
var log = console.log;

var fs = require('fs');
var async = require('async');

var Server = require('../');
var Client = require('../../socketstream-client');

var messagesToSend = 100000;

// Pass numbers of benchmarks to run via command line, or run all
var allBenchmarks = fs.readdirSync(__dirname).filter(function(n){ return n !== 'run.js'; });
var benchmarksToRun = process.argv.splice(2);
if (benchmarksToRun.length === 0) benchmarksToRun = allBenchmarks;

function run(bencharkNumber, cb) {

  var processed = 0;
  var startTime = Date.now();

  var finish = function() {
    var duration = Date.now() - startTime;
    var requestPerSecond = Math.floor((messagesToSend / duration)) * 1000;
    console.log('✓'.green, 'Requests per second:', requestPerSecond, "\n");
    cb(null);
  };

  var transport = Server.mockTransport();

  var client = new Client({transport: transport.client()});
  var server = new Server({root: __dirname, transport: transport});
 
  var benchmark = {};
  benchmark.processed = function(){
    if (++processed === messagesToSend) finish();
  };
  require('./' + bencharkNumber)(benchmark, server, client);

  server.start();

  client.load(server.publicServices());

  client.connect(function() {

    log("Benchmark %d:".yellow, Number(bencharkNumber.split('.')[0]), benchmark.name.cyan);

    for (var i = 0; i < messagesToSend; i++) {
      benchmark.run(client);
    }

  });

}

log();
log("SocketStream Server".green, "Micro Benchmarks".cyan);
log("------------------------------------\n".grey);
log("Each benchmark sends %d messages from the client to the server and back again.", messagesToSend);
log("Messages travel through the entire stack, apart from the websocket");
log("transport which is simulated here with an internal EventEmitter\n");


// Run benchmarks!
async.series(benchmarksToRun.map(function(num) {
  return function(cb) { run(num, cb); };
}));
