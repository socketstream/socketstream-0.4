"use strict";

/*
   
  HTML Injector
  -------------
  Injects CSS & JS tags into HTML views in the most optimal place
  Note: Even though views are cached in RAM in production, I'm trying to do this the simplest and
  fastest way possible. If it becomes necessary to add a HTML selector/parser in the future we will

  TODO: Convert to Streams2

  TODO: Make this entirely optional. If a user wants to control exactly where the top and bottom
  includes are injected, they should be able to do so (as in SocketStream 0.3)

*/

var Stream = require('stream');

var topTag = '<head',
    bottomTag = '</html>';

module.exports = function(includes) {

  var s = new Stream();

  s.readable = true;
  s.writable = true;

  s.write = function (input) {

    var originalHTML = input.toString(),
        lowecaseHTML = originalHTML.toLowerCase();

    // Only process if critical tags are present
    if (lowecaseHTML.indexOf(topTag) >= 0 && lowecaseHTML.indexOf(bottomTag) >= 0) {

      // Note we are buffering output as there is little to be gained from streaming it
      var outputHTML = '';

      // Insert topIncludes (typically CSS) just after the <head> tag
      var startOfTagIndex = lowecaseHTML.indexOf(topTag) + topTag.length;
      var endOfTagIndex = lowecaseHTML.substring(startOfTagIndex).indexOf('>');
      var topIndex = startOfTagIndex + endOfTagIndex + 1;

      // Insert bottomIncludes (typically JS) just after the closing </html> tag
      var bottomIndex = lowecaseHTML.lastIndexOf(bottomTag);

      // Compose HTML output
      outputHTML = originalHTML.substring(0, topIndex) + 
        includes.top.join('') + 
        originalHTML.substring(topIndex, bottomIndex) +
        includes.bottom.join('') + 
        originalHTML.substring(bottomIndex, originalHTML.length);

      s.emit('data', outputHTML);
    } else { // pass through
      s.emit('data', originalHTML);
    }

    s.emit('end');
  };

  s.end = function (buf) {
    if (arguments.length) s.write(buf);
    s.writable = false;
  };

  s.destroy = function () {
    s.writable = false;
  };

  return s;

};
