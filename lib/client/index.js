/*
   
   Single Page Client
   ------------------
   Defines a Single Page Client

*/

var fs = require('fs'),
    path = require('path'),
    Stream = require('stream'),
    oppressor = require('oppressor'),

    htmlInjector = require('./html_injector'),
    htmlIncludes = require('./html_includes'),
    Code = require('./code');


var count = 0

var SinglePageClient = function(app, viewName, paths){

  var self = this

  self.id = ++count
  self.app = app
  self.paths = paths

  self.code = new Code(app.clients.code)

  self.viewName = viewName
  self.viewExtension = viewName.slice(viewName.lastIndexOf('.')+1)

  // Name of first module to call
  self.firstModule = 'entry'

}

// Serves the raw HTML only
SinglePageClient.prototype.html = function(request){
  var html = fs.createReadStream(path.join(this.root, this.viewName));
  return html;
}

// Inject Asset Tags into HTML stream
SinglePageClient.prototype.injectAssetTags = function(){
  // Get a list of HTML tags to include
  var includes = htmlIncludes(this.app.root, this.id, this.paths, false)
  return htmlInjector(includes)
}

// Helper command to serve the completed View
SinglePageClient.prototype.view = function(request){

  var preprocessor = this.app.preprocessors[this.viewExtension];
  
  // Start with raw HTML
  var view = this.html(request)

  // Pre-process Jade or whatever into proper HTML
  if (preprocessor) view = view.pipe(preprocessor)

  // Inject Asset Tags into HTML
  view = view.pipe(this.injectAssetTags())

  // GZip output if browser supports it
  view.pipe(oppressor(request))

  return view;
}


module.exports = SinglePageClient;