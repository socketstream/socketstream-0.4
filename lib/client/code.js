"use strict";

/*
   
   Client Code
   -----------
   Stores and generates Javascript code to be sent to the Browser

*/

var fs = require('fs');

function ClientCode(parent, client){
  this.parent = parent;
  this.client = client;

  this.codeBuffer = {
    libraries:  [],
    init:       []
  };
}

// Send a code library (e.g. jQuery, Backbone.js)
ClientCode.prototype.sendLibrary = function(content, options){
  if (!options) options = {};

  // Load if file
  if (content[0] === '/') content = fs.readFileSync(content, 'utf8');
  
  // Prevent dupes
  if (this.codeBuffer.libraries.some(function(x){ return x.content === content; })) {
    throw new Error('Library already added!');
  }

  this.codeBuffer.libraries.push({content: content, options: options});
};

// Libraries and Modules to be combined in one file
ClientCode.prototype.outputLibsAndModules = function(options) {

  if (options === null) options = {};

  var output = this.parent ? this.parent.outputLibsAndModules(options) : [];

  // Output Libraries
  this.codeBuffer.libraries.forEach(function(code) {
    // let's not think about compression just yet
    //if (options.compress && !code.options.preMinified) code.content = minifyJS(code.content);
    output.push(code.content);
  });

  return output;
};

module.exports = ClientCode;
