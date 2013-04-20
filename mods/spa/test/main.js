var should = require('should');
var SPA = require('../');

describe('defining a SPA', function(){

  it('should error if no view supplied', function() {

    (function(){ 
      var client = new SPA();
    }).should.throw('A view path must be provided');

  });

  it('should only accept paths as an object', function() {

    (function(){ 
      var client = new SPA('index.html', 'WRONG!');
    }).should.throw('Paths must be provided as an object');

  });

});


describe('outputting view', function(){

  it('should output raw HTML', function() {

    var client = new SPA(__dirname + 'fixtures/index.html');

    client.html();
    

  });



});