var should = require('should');
var Model = require('../index');

describe('a model', function(){

  var rtm = new Model('products', {});

  it('should have a name', function(){
    rtm.name.should.equal('products');
  });

  it('should add clients to watch list', function(){
    rtm.watch(3, 1234); // first client
    rtm.watch(3, 1235); // second client
    rtm.watched[3].should.have.length(2);
  });

});