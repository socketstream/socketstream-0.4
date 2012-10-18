// Wraps Jade with a streaming interface
// Note this file will live in a separate (optional) module before 0.4 is released
// Hopefully one day it won't be necessary at all :)

var Stream = require('stream'),
    jade = require('jade');

module.exports = function(options) {

  options = options || {};

  var s = new Stream;

  s.readable = true;
  s.writable = true;

  s.write = function (input) {
    try {
      var parser = jade.compile(input);
      var output = parser();
      s.emit('data', new Buffer(output));
      s.emit('end')
    } catch (err) {
      s.emit('error', err);
    }
  };

  s.end = function (buf) {
    if (arguments.length) s.write(buf);
    s.writable = false;
  };

  s.destroy = function () {
    s.writable = false;
  };

  return s;

}