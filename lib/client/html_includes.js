"use strict";

/*
   
   HTML Includes
   -------------
   Generates two sets of HTML tags (for the top and bottom of the main HTML) for all
   the JS and CSS your HTML view requires. Adds a timestamp to prevent caching
   The output depends upon whether or not we're serving cached assets in production

*/

var path = require('path'),
    fsUtils = require('../utils/fs.js');

module.exports = function(root, clientId, paths) {

  // Append cache buster and clientId to all URLs
  function params(p) {
    p = p || {};
    p.ts = ts;
    p.clientId = clientId;
    return p;
  }


  // Includes are the JS tags, CSS tags and raw JS code which are concatinated 
  // and used to replace the <SocketStream> tag (or !SocketStream in Jade)
  var topIncludes = [],
      bottomIncludes = [];

  // Cache busting timestamp
  var ts = Number(Date.now());

  // HEADERS

  // Send all CSS
  if (paths.css) {
    paths.css.forEach(function(thisPath) {
      var fileNames = fsUtils.getFileNamesSync(root, thisPath);
      fileNames.forEach(function(fileName){
        topIncludes.push(tag.css("/_ss/css/" + path.basename(fileName), params({path: fileName}) ));
      });
    });
  }

  // Send SocketStream System Libs and Modules
  bottomIncludes.push(tag.js("/_ss/js/_system/", params() ));

  // Send Application Libraries
  if (paths.libs) {
    var fileNames = fsUtils.getFileNamesSync(root, paths.libs);
    fileNames.forEach(function(fileName){
      bottomIncludes.push(tag.js("/_ss/js/libs/" + fileName, params({path: fileName}) ));
    });
  }

  // Now send the modules, including the System module which wires everything up
  bottomIncludes.push(tag.js("/_ss/js/modules/", params({}) ));


  return {top: topIncludes, bottom: bottomIncludes};

};


function toQueryString(params) {
  var pairs = [];
  Object.keys(params).forEach(function(key) {
    pairs.push(key + '=' + params[key]);
  });
  return '?' + pairs.join('&');
}


var tag = {

  css: function(path, params) {
    return '<link href="' + path + toQueryString(params) + '" media="screen" rel="stylesheet" type="text/css">';
  },

  js: function(path, params) {
    return '<script src="' + path + toQueryString(params) + '" type="text/javascript"></script>';
  }
};
