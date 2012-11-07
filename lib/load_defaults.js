/*
   
   Defaults
   --------
   Setup essential defaults before SocketStream loads

*/

var path = require('path'),
    fsUtils = require('./fs_utils')

module.exports = function(app){

  // Send default files to client
  // app.options = {
  //   client: {
  //     prefix: 'client',
  //     dirs: { css: 'css', code: 'code', libs: 'libs', tmpl: 'tmpl' }
  //   }
  // }

  // Libraries (must send in order)
  ['json.min.js', 'mux-demux-bundle.js'].forEach(function(fileName) {
    var filePath = path.join(__dirname, '/client/libs', fileName);
    app.clients.code.sendLibrary(filePath)
  });

  // Modules (can send in any order)
  var modDir = path.join(__dirname, '/client/modules');
  fsUtils.readDirSync(modDir).files.forEach(function(fileName) {
    app.clients.code.sendModule(moduleName(fileName, modDir), fileName)
  });

};

function moduleName(fileName, modDir) {
  var sp = fileName.split('.');
  var extension = sp[sp.length - 1];
  return fileName.substr(modDir.length + 1);
};