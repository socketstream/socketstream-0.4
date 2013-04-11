"use strict";

/*!
 * WebSocket Realtime Transport Spec
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
    client: require('./client')
  };
};

