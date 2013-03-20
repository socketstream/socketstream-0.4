var should = require('should');

var ServiceManager = require('../../realtime-service');
var services = new ServiceManager({root: __dirname});

var definition = require('../')();

var rpc = services.register('testRpc', definition).testClient();

describe('rpc service', function(){

  it('should square a number', function(done){

    rpc('demo.square', 5, function(err, answer){
      should.not.exist(err);
      answer.should.equal(25);
      done();
    });
    

  });

});