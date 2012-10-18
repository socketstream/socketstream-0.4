/*
   
   Defaults
   --------
   Setup essential defaults before SocketStream loads

*/

var path = require('path'),
    fsUtils = require('./fs_utils')

module.exports = function(app){

  // Send default files to client

  // Libraries (must send in order)
  ['json.min.js', 'browserify.js', 'mux-demux-bundle.js'].forEach(function(fileName) {
    var filePath = path.join(__dirname, '/client/libs', fileName);
    app.clients.code.sendLibrary(filePath)
  });

  // Modules (can send in any order)
  var modDir = path.join(__dirname, '/client/modules');
  fsUtils.readDirSync(modDir).files.forEach(function(fileName) {
    app.clients.code.sendModule(moduleName(fileName, modDir), fileName)
  });

  // Code to establish connection
  app.clients.code.sendCode("require('socketstream')()")

};

function moduleName(fileName, modDir) {
  var sp = fileName.split('.');
  var extension = sp[sp.length - 1];
  return fileName.substr(modDir.length + 1);
};