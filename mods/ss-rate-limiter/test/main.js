var should = require('should');
var EventEmitter = require('events').EventEmitter;
var middleware = require('../');

var mockServer = {
  events: new EventEmitter()
};

describe('rate limiting middleware', function(){

  it('return a function', function() {
    middleware({}).should.be.a('function');
  });

  it('take a server object and return another function (for each requests)', function() {
    var m = middleware({});
    m(mockServer).should.be.a('function');
  });

  it('should normally let requests through', function(done) {
    var m = middleware({});
    var handler = m(mockServer);
    var mockRequest = { socketId: '1234' };

    handler(mockRequest, null, done);
  });

  it('should drop excess requests', function(done) {
    var m = middleware({maxRequestsPerSecond: 2});
    var handler = m(mockServer);
    var mockRequest = { socketId: '1234' };

    handler(mockRequest, null, function() {
      handler(mockRequest, null, function() {
        handler(mockRequest, function(err) {
          err.should.be.equal('Request dropped by rate limiter');
          done();
        }, function(){});
      });
    });
  });

});