/*

  Define Middleware (callbacks)

*/

var shared = require('./shared');

// define middleware stack
var stack = [];

// message validation (e.g. rate limiting)
stack.push(function(req, res, next){
  if (req.msg.length > 2 && req.msg.length < 2046) {
    next();
  }
});

// demultiplex message (assign to service)
stack.push(function(req, res, next){
  var msgAry = shared.demultiplexMessage(req.msg);
  req.msg = msgAry[1];
  next();
});

// sessions
stack.push(function(req, res, next){
  req.session = {id: 1, attributes: {fake: true}};
  next();
});

// simulate a real RPC call
stack.push(function(req, res, next){
  var obj = JSON.parse(req.msg);
  shared.rpcMethods[obj.m](obj.p, function(response){
    res(null, response);
  });
});

function executeMiddleware(req, res, i) {
  stack[i].call(stack, req, res, function(){
    executeMiddleware(req, res, i + 1);
  });
}

module.exports = function (passes, cb) {
  var start = Date.now();
  var thisPass = passes;
  var returned = 0;

  var fn = function(err, res) {
    returned++;
    if (passes === returned) {
      cb(String(Date.now() - start));
    }
  };

  while (thisPass > 0) {
    var msg = shared.getRandomMsg();
    var req = {msg: msg};
    executeMiddleware(req, fn, 0);
    thisPass--;
  }
   
};
