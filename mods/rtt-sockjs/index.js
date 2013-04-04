"use strict";

/*!
 * SockJS Realtime Transport Spec
 * Copyright(c) 2013 Owen Barnes <owen@socketstream.org>
 * MIT Licensed
 */

module.exports = function(options) {

  options = options || {};
  
  options.port = options.port || 3001;
  options.client = options.client || {};
  options.server = options.server || {};
  options.client.port = options.port;

  return {
    options: options,
    server: require('./server')(options),   
    client: require('./client'),  
    // Note: I've removed the minfied JSON lib as that is normally sent at the framework/app level
    browserAssets: [{filename: __dirname + '/browser-lib.min.js', type: 'js'}]
  };
};

