/*
  
  Streams2 vs Middleware (callbacks) benchmarks

  This is a quick and dirty exploratory benchmark to determine which method is faster at processing
  a typical incoming message sent from the browser over the websocket.

  To simulate a typical SocketStream workflow, the following actions are performed on each incoming request

  - validate the message
  - demultiplex message (so we can send it to the right service)
  - look up a users session info
  - execute an RPC function
  - send the result to the browser

  These are implemented first as Connect-style middleware (callbacks) and then as Streams2

  At the moment Streams2 is almost 10 times slower than Middleware. If you think you can help
  speed it up please do!!

*/

var middleware = require('./middleware');
var streams = require('./streams2');

var messagesToProcess = 50000;

console.log('Beginning Middleware...');
middleware(messagesToProcess, function(timeInMs) {
  console.log(String(messagesToProcess) + " messages through Middleware took " + timeInMs + "ms");
});

console.log('Beginning Streams2...');
streams(messagesToProcess, function(timeInMs) {
   console.log(String(messagesToProcess) + " messages through Streams2 took " + timeInMs + "ms");
});

