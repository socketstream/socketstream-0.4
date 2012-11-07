/*
   
   Asset Server
   ------------
   Serve JS, CSS and static files to the client over HTTP, preprocessing them first if required

*/

var fs = require('fs'),
    path = require('path'),
    url = require('url'),
    querystring = require('querystring'),
    Stream = require('stream')


module.exports = function(root, clients, preprocessors, request){

  var sp = request.url.split('/')

  // Serve Assets in Developer Mode
  if (sp[1] == '_ss' && sp[3]) {

    // Get Extension
    var thisUrl = url.parse(request.url)
    var qs = querystring.parse(thisUrl.query)

    // Get Client
    var client = clients[qs.clientId-1]
   
    // TODO: Refactor. This is ugly!
    var systemCode = {
      '_system': client.code.outputLibsAndModules(),
      '_start':  client.code.outputInit()
    }

    // Select mime type
    var mimetype = mimetypes[sp[2]]

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

      var fileName = path.join(root, qs.path)
      var file = fs.createReadStream(fileName)
      var ext = fileName.slice(fileName.lastIndexOf('.')+1)

      // Pre-process if required
      if (preprocessors[ext]) file = file.pipe(preprocessors[ext])

      // Wrap with module
      if (qs.moduleName) file = file.pipe(wrapModule(qs.moduleName))
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

  }

}

// Wrap a code module for Browserify
function wrapModule(modPath) {
  var s = new Stream
  s.readable = true
  s.writable = true

  s.write = function(code) {
    var output = "require.define(\"" + modPath + "\", function (require, module, exports, __dirname, __filename){\n" + code + "\n});";
    s.emit('data', output)
    s.emit('end')
  }

  return s
};

var mimetypes = {
  css: 'text/css',
  js:  'text/javascript'
}