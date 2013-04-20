/**
 *  Internal system service used to send session ID and discover other services
 */

/* Don't warn about eval - it's the only way to download */
/* code from the server and run it on the client */
/* jshint evil: true */

module.exports = function(app) {

  app.provide({id: "0", name: "_system", private: true, use: {json: true, callbacks: true}}, function(client){

    // If a request to the server returns an error, show it here
    client.onmessage = function(obj){
      if (obj.type === 'error') {
        console.error('Server Error: ' + obj.message);
      }
    };
    
    return {

      // Pass session ID if we have one
      connect: function(cb) {
        client.send({c: 'connect', v: app.version, sessionId: app._getSessionId()}, function(clientInfo){
          app._setSessionId(clientInfo.sessionId);
          app.status.emit('ready');
          if (cb) cb(null, clientInfo);
        });
      },

      // Download list of available services from the server
      discover: function(options, cb){
        options = options || {};
        client.send({c: 'discover', p: options}, function(reply){

          reply.forEach(function(service){
            var handler;
            eval('handler = ' + service.handler);
            app.provide(service.params, handler);
          });

          cb();

        });
      }
    };
  });

};