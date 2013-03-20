module.exports = function(client) {

  function defaultCallback(x) {
    return console.log(x);
  }

  // Return API to call functions on the server
  return function() {
    var args = Array.prototype.slice.call(arguments);

    var msg = { m: args[0] };
    var lastArg = args[args.length - 1];

    var cb;
    if (typeof lastArg === 'function') {
      msg.p = args.slice(1, args.length - 1);
      cb = lastArg;
    } else {
      msg.p = args.slice(1);
      cb = defaultCallback;
    }

    client.send(msg, function(obj){
      if (obj.e) {
        console.error('RPC server error:', obj.e.message);
      } else {
        cb.apply(cb, obj.p);
      }
    });

    // Always return 'undefined'      
    return void 0;
  };

};