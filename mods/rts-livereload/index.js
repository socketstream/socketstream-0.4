"use strict";

/*

  Live Reload Service
  -------------------
  Detects changes in client files and sends an event to connected browsers instructing them to refresh the page

*/

require('colors');

var path = require('path'),
    chokidar = require('chokidar');

module.exports = function(options) {

  options = options || {};
  options.dirs = options.dirs || ['/client'];
  options.cssExtensions = options.cssExtensions || ['css', 'styl', 'less', 'sass'];

  var actions = {};

  var service = {};

  service.client = require('./client.js');

  // Called when the Realtime Server starts up
  service.server = function(server) {

    server.log('i'.yellow, 'Monitoring changes in', options.dirs.join(', '));

    function Action (name, message) {
      actions[name] = this;
      this.lastRun = Date.now();
      this.execute = function(){
        // Reload browser max once per second
        if ((Date.now() - this.lastRun) > 1000) {
          server.log('✎'.green, message);
          server.broadcast(name);
          this.lastRun = Date.now();
        }
      };
    }

    // Just reload the CSS, not the entire page
    new Action('updateCSS', 'CSS files changed. Updating browser...');

    // Reload everything
    new Action('reload', 'Client files changed. Reloading browser...');

    // Figure out which directories to watch
    var dirs = options.dirs;
    if (typeof dirs == 'string') dirs = [dirs];
    var directoriesToWatch = dirs.map(function(dir){
      return path.join(server.service.assigned.root, '..', dir);
    });

    // Everytime a file changes in anyway, run this
    function onChange(filePath, event) {
      if (path.basename(filePath) === 'system.js') return false; // temporary hack whilst we experiment with browserify 2
      var extension = (path.extname(filePath)).substring(1);
      var actionName = (options.cssExtensions.indexOf(extension) >= 0 ) ? 'updateCSS' : 'reload';
      actions[actionName].execute();
    }

    // Begin watching
    var watcher = chokidar.watch(directoriesToWatch, {ignored: /(\/\.|~$)/});

    watcher.on('add',     function(filePath)  { onChange(filePath, 'added'); });
    watcher.on('change',  function(filePath)  { onChange(filePath, 'changed'); });
    watcher.on('unlink',  function(filePath)  { onChange(filePath, 'removed'); });
    watcher.on('error',   function(error)     { service.error(error); });

    return null;

  };

  return service;
};
