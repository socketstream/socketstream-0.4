function(client) {

  var Stream = require('stream');

  // Only Streams1 in Browserify for now :-(
  var s = new Stream();

  s.readable = true;
  s.writable = true;

  client.onmessage = function(msg) {
    //console.log('message in from stream service!', msg);
    s.emit('data', msg);
  };

  s.write = function(buf) {
    client.write(buf);
  };

  return s;

}