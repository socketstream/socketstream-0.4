// Wraps Stylus with a streaming interface
// Note this file will live in a separate (optional) module before 0.4 is released
// Hopefully one day it won't be necessary at all :)
// TODO: Find the best way to pass the file path to enable the @include command to work correctly

var Stream = require('stream'),
    stylus = require('stylus'),
    nib = require('nib');

module.exports = function(options) {

  options = options || {};

  var s = new Stream;

  s.readable = true;
  s.writable = true;
  
  s.write = function (input) {
    stylus(input.toString())
      .use(nib())
      .render(function(err, output){
        if (err) return s.emit('error', err)
        s.emit('data', new Buffer(output));
        s.emit('end');
      });
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