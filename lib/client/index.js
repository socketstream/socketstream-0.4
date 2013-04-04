"use strict";

/*
   
   Single Page Client
   ------------------
   Defines a Single Page Client

*/

var fs = require('fs'),
    path = require('path'),
    oppressor = require('oppressor'),

    htmlInjector = require('./html_injector'),
    htmlIncludes = require('./html_includes');


var count = 0;

var SinglePageClient = function(app, viewName, paths, browserAssets){

  var self = this;

  self.id = ++count;
  self.app = app;
  self.paths = paths;
  self.browserAssets = browserAssets || function(){};

  self.viewName = viewName;
  self.viewExtension = viewName.slice(viewName.lastIndexOf('.')+1);

  // Name of first module to call
  self.firstModule = 'entry';

};


// Serves the raw HTML only
SinglePageClient.prototype.html = function(request){
  var html = fs.createReadStream(path.join(this.app.root, this.viewName));
  return html;
};

// Inject Asset Tags into HTML stream
SinglePageClient.prototype.injectAssetTags = function(){
  // Get a list of HTML tags to include
  var includes = htmlIncludes(this.app.root, this.id, this.paths);
  return htmlInjector(includes);
};

// Helper command to serve the completed View
SinglePageClient.prototype.view = function(request){

  var preprocessor = this.app.preprocessors[this.viewExtension];
  preprocessor.removeAllListeners();
  
  // Start with raw HTML
  var view = this.html(request);
  view.removeAllListeners();

  // Pre-process Jade or whatever into proper HTML
  if (preprocessor) view = view.pipe(preprocessor);

  // Inject Asset Tags into HTML
  var assetTags = this.injectAssetTags();
  assetTags.removeAllListeners();
  view = view.pipe(assetTags);

  // GZip output if browser supports it
  view.pipe(oppressor(request));

  return view;
};


module.exports = SinglePageClient;