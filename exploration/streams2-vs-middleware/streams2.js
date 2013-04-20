/*

  Define Streams2

  If you can see any way of speeding this up please let me know!

*/

var Stream = require('stream');
var shared = require('./shared');

module.exports = function(passes, cb){
  
  var start = Date.now();
  var messagesSent = 0;
  var messagesRec = 0;

  // Source stream
  var browser = new Stream.Duplex({});

  browser._read = function(size) {
    if (messagesSent === passes) return false;
    this.push(shared.getRandomMsg());
    messagesSent++;
    return true;
  };

  browser._write = function(size) {

  };

  browser.write = function(chunk) {
    //console.log('msg back to browser', chunk.toString());
    messagesRec++;
    if (messagesSent === messagesRec) {
      cb(String(Date.now() - start));
      return false;
    }
  };

  var validateMessage = new Stream.Transform();
  validateMessage._transform = function(chunk, encoding, cb) {
    if (chunk.length > 2 && chunk.length < 2046) {
      this.push(chunk);
      cb();
    }
  };

  var demultiplex = new Stream.Transform();
  demultiplex._transform = function(chunk, encoding, cb) {
    var msgAry = shared.demultiplexMessage(chunk.toString());
    this.push(msgAry[1]);
    cb();
  };

  var getSession = new Stream.Transform();
  getSession._transform = function(chunk, encoding, cb) {
    var session = {id: 1, attributes: {fake: true}};
    // can't append this as chunk is not an object
    this.push(chunk);
    cb();
  };


  var server = new Stream.Duplex();
  server._read = function(size) {
    //console.log('getting through to server-read');
  };

  // simulate a real RPC call
  server._write = function(chunk, encoding, cb) {
    var self = this;
    var obj = JSON.parse(chunk);
    shared.rpcMethods[obj.m](obj.p, function(response){
      self.push(JSON.stringify(response));
      cb();
    });  
  };

  // Wire it up
  // There's no denying it, this is beautiful!
  browser.pipe(validateMessage).pipe(demultiplex).pipe(getSession).pipe(server).pipe(browser);
};

