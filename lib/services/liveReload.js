/*

  Live Reload Service
  -------------------
  Detects changes in client files and sends an event to connected browsers instructing them to refresh the page

*/

require('colors')

var path = require('path'),
    chokidar = require('chokidar')

function LiveReload (app, options) {

  options = options || {}
  options.dirs = options.dirs || ['/client']
  options.cssExtensions = options.cssExtensions || ['css', 'styl', 'less', 'sass']

  var actions = {}

  return {
    server: function(stream) {

      function Action (name, message) {
        actions[name] = this
        this.lastRun = Date.now()
        this.execute = function(){
          // Reload browser max once per second
          if ((Date.now() - this.lastRun) > 1000) {
            app.log.debug('✎'.green, message.grey)
            stream.emit('data', name)
            this.lastRun = Date.now()
          }
        }
      }

      // Just reload the CSS, not the entire page
      new Action('updateCSS', 'CSS files changed. Updating browser...')

      // Reload everything
      new Action('reload', 'Client files changed. Reloading browser...')

      // Figure out which directories to watch
      var dirs = options.dirs
      if (typeof dirs == 'string') dirs = [dirs]
      var directoriesToWatch = dirs.map(function(dir){
        return path.join(app.root, dir)
      })

      // Everytime a file changes in anyway, run this
      function onChange(filePath, event) {
        var extension = (path.extname(filePath)).substring(1)
        var actionName = (options.cssExtensions.indexOf(extension) >= 0 ) ? 'updateCSS' : 'reload'
        actions[actionName].execute()
      };

      // Begin watching
      var watcher = chokidar.watch(directoriesToWatch, {ignored: /(\/\.|~$)/})

      watcher.on('add',     function(filePath)  { onChange(filePath, 'added'); })
      watcher.on('change',  function(filePath)  { onChange(filePath, 'changed'); })
      watcher.on('unlink',  function(filePath)  { onChange(filePath, 'removed'); })
      watcher.on('error',   function(error)     { app.log.error(error); })

    },

    client: function(stream) {

      stream.write = function(msg) {

        // Reload browser if reload system event received
        switch (msg) {
          case 'reload':
            window.location.reload()
            break;
          case 'updateCSS':
            var tags = document.getElementsByTagName("link");
            for (var i = 0; i < tags.length; i++) {
              var tag = tags[i];
              if (tag.rel.toLowerCase().indexOf("stylesheet") >= 0 && tag.href) {
                var h = tag.href.replace(/(&|%5C?)\d+/, "");
                tag.href = h + (h.indexOf("?") >= 0 ? "&" : "?") + (new Date().valueOf());
              }
            }
            break;
        }
      }
    }

  }

}

module.exports = LiveReload
