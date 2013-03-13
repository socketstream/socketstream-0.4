function(client) {

  var EE = require('events').EventEmitter;
  var ee = new EE();

  client.onmessage = function(obj) {
    ee.emit(obj.e, obj.p);
  };

  return ee;

}