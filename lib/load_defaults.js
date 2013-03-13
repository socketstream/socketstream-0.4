"use strict";

/*
   
   Defaults
   --------
   Setup essential defaults before SocketStream loads

*/

var path = require('path'),
    fsUtils = require('./utils/fs');

module.exports = function(app){

  // Libraries (must send in order)
  ['json.min.js'].forEach(function(fileName) {
    var filePath = path.join(__dirname, '/client/libs', fileName);
    app.clients.code.sendLibrary(filePath);
  });

};
