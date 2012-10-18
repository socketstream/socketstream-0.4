/*
   
   Client Code
   -----------
   Stores and generates Javascript code to be sent to the Browser

*/

var fs = require('fs'),
    uglifyjs = require('uglify-js')

function ClientCode(parent){
  this.parent = parent;

  this.codeBuffer = {
    libraries:  [],
    modules:    {},
    init:       []
  }
}

// Send a code library (e.g. jQuery, Backbone.js)
ClientCode.prototype.sendLibrary = function(content, options){
  if (!options) options = {};

  // Load if file
  if (content[0] === '/') content = fs.readFileSync(content, 'utf8')
  
  // Prevent dupes
  if (this.codeBuffer.libraries.some(function(x){ return x.content === content; })) {
    throw new Error('Library already added!')
  }

  this.codeBuffer.libraries.push({content: content, options: options});
}

// Send code as a Common JS module
ClientCode.prototype.sendModule = function(name, content, options){
  if (!options) options = {};

  // Load if file
  if (content[0] === '/') content = fs.readFileSync(content, 'utf8')

  if (this.codeBuffer.modules[name]) return false; // Prevent dupes
  this.codeBuffer.modules[name] = {content: content, options: options};
}

// Send code to be called once everything else has been transferred
ClientCode.prototype.sendCode = function(content, options){
  this.codeBuffer.init.push({content: content, options: options});
}

// Libraries and Modules to be combined in one file
ClientCode.prototype.outputLibsAndModules = function(options) {

  if (options == null) options = {};

  var output = this.parent ? this.parent.outputLibsAndModules(options) : [];

  // Output Libraries
  this.codeBuffer.libraries.forEach(function(code) {
    if (options.compress && !code.options.preMinified) code.content = minifyJS(code.content);
    output.push(code.content);
  });

  // Output Modules
  for (name in this.codeBuffer.modules) {
    var mod = this.codeBuffer.modules[name];
    var code = wrapModule(name, mod.content);

    if (options.compress && !mod.options.preMinified) code = minifyJS(code);
    output.push(code);
  }

  return output;
}

// All Initial code to be sent (e.g. to call modules and establish the initial WS connection)
ClientCode.prototype.outputInit = function(options) {

  var output = this.parent ? this.parent.outputInit(options) : [];

  this.codeBuffer.init.forEach(function(statement){
    output.push(statement.content);
  });

  return output;
}

module.exports = ClientCode


// Wrap a code module for Browserify
function wrapModule(modPath, code) {
  return "require.define(\"" + modPath + "\", function (require, module, exports, __dirname, __filename){\n" + code + "\n});";
};

// Minify / obfuscate JS code using UglifyJS
function minifyJS(originalCode) {
  if (typeof originalCode != 'string') {
    originalCode = originalCode.join(';');
  }
  var jsp = uglifyjs.parser;
  var pro = uglifyjs.uglify;
  var ast = jsp.parse(originalCode);
  ast = pro.ast_mangle(ast);
  //ast = pro.ast_squeeze(ast);
  return pro.gen_code(ast) + ';';
};



