/*
   
   Asset Server
   ------------
   Serve JS, CSS and static files to the client over HTTP, preprocessing them first if required
   TODO: Refactor this file. Remove the responsibility of serving static files from this module
   and create a separate app.serveStatic() function instead

*/

var fs = require('fs'),
    path = require('path'),
    url = require('url'),
    querystring = require('querystring'),
    Stream = require('stream'),
    filed = require('filed')


module.exports = function(app, request){

  var sp = request.url.split('/')

  // Serve Assets in Developer Mode
  if (sp[1] == '_ss' && sp[3]) {

    // Get Extension
    var thisUrl = url.parse(request.url)
    var qs = querystring.parse(thisUrl.query)
    
    // Select mime type
    var mimetype = mimetypes[sp[2]]

    // TODO: Refactor this to find a better way to pass client-side system code
    var systemCode = {
      '_system': app.clients.code.outputLibsAndModules(),
      '_start':  app.clients.code.outputInit()
    }

    // Serve System JS Code
    if (Object.keys(systemCode).indexOf(sp[3]) >= 0) {

      var file = new Stream
      file.readable = true
      process.nextTick(function(){
        file.emit('data', systemCode[sp[3]].join(";\n").toString())
        file.emit('end')
      })
    
    // Serve Asset File
    } else {

      var fileName = path.join(app.root, qs.path)
      var file = fs.createReadStream(fileName)
      var ext = fileName.slice(fileName.lastIndexOf('.')+1)

      // Pre-process if required
      if (app.preprocessors[ext]) file = file.pipe(app.preprocessors[ext])
    }

    // Overwrite pipe() so we can apply headers. This still feels nasty :(
    var originalPipe = file.pipe.bind(file)
    file.pipe = function(dest, options){
      this.dest = dest
      if (this.dest.setHeader) {
        this.dest.setHeader('content-type', mimetype)
      }
      originalPipe(dest, options)
    }

    return file

  // Serve static assets with correct headers using filed
  } else {
    // TODO: Move this responsibility to another module and allow path to be configured
    return filed(app.root + '/client/public/' + request.url)
  }

}

var mimetypes = {
  css: 'text/css',
  js:  'text/javascript'
}