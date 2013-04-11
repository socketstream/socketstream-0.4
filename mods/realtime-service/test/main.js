var should = require('should');
var ServiceManager = require('../');
var manager = new ServiceManager();

var serviceDef = {

  client: function(client) {

    client.onmessage = function(msg) {
      client.log('message in from server', msg);
    };

    return function(msg) {
      client.send('message from client: ' + msg);
    };

  },

  server: function(server) {

    server.onmessage = function(msg, meta, reply) {
      server.log('message in from client ID ' + meta.socketId, msg);
      reply('ACK');
    };

    return function(msg) {
      server.log('sending to everyone');
      server.broadcast('I have a message for everyone: ' + msg);
    };
  }
};

var service = manager.register('basic', serviceDef);


describe('Accessing basic info', function(){

  it('should return the current RTS API version', function(){
    service.assigned.rtsVersion.should.equal('0.0.1');
  });

  it('should output an object of params to be sent to the client', function(){
    var params = service.paramsForClient();
    params.name.should.equal('basic');
    params.id.should.equal(0);
  });

});


