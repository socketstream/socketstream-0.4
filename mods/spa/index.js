"use strict";

/*!
 * SPA - Single Page Application
 * -----------------------------
 *
 * Serve and build assets for Single Page Apps
 * Caution: This is a work in progress. It will change substantially!
 *
 * Copyright(c) 2013 Owen Barnes <owen@socketstream.org>
 * MIT Licensed
 */

var fs = require('fs');
var path = require('path');
var browserify = require('browserify');
var view = require('./view');


function SPA(viewPath, assetPaths, options) {

  if (!viewPath) throw new Error('A view path must be provided');
  if (assetPaths && typeof(assetPaths) !== 'object') throw new Error('Paths must be provided as an object');

  this.root = options.root || '';
  this.viewPath = viewPath;
  this.engines = {};
  this.paths = assetPaths || {};

  var serveStraight = function(filename, options, fn) {
    fs.readFile(filename, fn);
  };

  if (options.baseDir) {
    this.viewPath = options.baseDir + '/' + this.viewPath;
    this.paths = this.prependBaseDir(options.baseDir);
  }

  // Serve 'raw' assets without modification
  ['css', 'js', 'html'].forEach(function(ext){
    this.engines[ext] = serveStraight;
  }.bind(this));

  // This totally sucks. Will be changed
  var out = this.serve.bind(this);
  out.engine = this.engine.bind(this);
  out.middleware = this.middleware.bind(this);
  out.addAsset = this.addAsset.bind(this);
  return out;

}

/**
 * Serve View
 */

SPA.prototype.serve = function(req, res) {
  this.html(function(err, html){
    res.setHeader('Content-Type', mimeTypes.html);
    res.end(html);
  });
};


/**
 * Get HTML
 */

SPA.prototype.html = function(cb) {
  var viewAry = this.viewPath.split('.');
  var ext = viewAry.pop().toLowerCase();

  var filename = this.viewPath;
  if (filename[0] !== '/') filename = path.join(this.root, filename);
  
  this.engines[ext](filename, {}, function(err, html){
    if (err) throw(err);
    var output = view(html.toString(), this.devPaths());
    cb(null, output);
  }.bind(this));
};


SPA.prototype.devPaths = function() {
  var transformation = function(path, assetType){
    if (path[0] !== '/') path = '/__root/' + path;
    return '/_dev/' + assetType + path;
  };
  return transformPaths(this.paths, transformation);
};

SPA.prototype.prependBaseDir = function(dir) {
  var transformation = function(path){ return dir + '/' + path; };
  return transformPaths(this.paths, transformation);
};


SPA.prototype.addAsset = function(type, asset, options) {
  options = options || {};
  var method = options.atTop ? 'unshift' : 'push';
  if (!this.paths[type]) this.paths[type] = [];
  this.paths[type][method](asset.filename);
};




/**
 * Provide Connect/Express Middleware
 * to serve assets live in development
 */

SPA.prototype.middleware = function(req, res, next) {
  // Only serve requests for us
  if (req.url.substr(0, 6) !== '/_dev/') return next();
  
  var urlAry = req.url.split('/').splice(2);
  var assetType = urlAry.shift();

  var serve = function(err, body) {
    body = body.toString();
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', mimeTypes[assetType]);
    res.setHeader('Content-Length', Buffer.byteLength(body));
    res.end(body);
  };

  // Serve Modules
  if (urlAry[0] === '__modules.js') return this.serveModules(res);

  // Serve Files
  var filename = '/' + urlAry.join('/');
  filename = filename.replace('__root', this.root);
  var fileAry = filename.split('.');
  var ext = fileAry.pop().toLowerCase();

  // Drop source map requests for now
  if (ext === 'map') return;

  if (!this.engines[ext]) throw new Error('Unable to handle ' + ext + ' files');
  this.engines[ext](filename, {}, serve);
 
};

SPA.prototype.serveModules = function(res) {
  var b = browserify();
  b.add(this.root + '/client/app/entry.js');
  b.bundle({debug: true}).pipe(res);
};


/**
 * Register a preprocessor / templating engine
 * Fully compatible with Express.
 * The code inside this function was adapted from Express.js
 */

SPA.prototype.engine = function(ext, fn){
  if ('function' !== typeof fn) throw new Error('client.engine() requires a callback');
  if (ext[0] == '.') ext = ext.substr(1);
  this.engines[ext] = fn;
  return this;
};


function transformPaths(paths, fn) {
  var output = {};
  for (var assetType in paths) {
    var transform = function(path){
      // bypass if external CDN asset
      if (path.substr(0, 2) === '//') return path;
      return fn(path, assetType);
    };
    output[assetType] = paths[assetType].map(transform);
  }
  return output;
}

var mimeTypes = {
  html: 'text/html',
  css:  'text/css',
  js:   'text/javascript'
};

module.exports = SPA;