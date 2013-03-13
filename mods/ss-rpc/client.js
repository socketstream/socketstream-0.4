function(client) {

  function defaultCallback(x) {
    return console.log(x);
  }

  // Handle incoming responses
  client.onmessage = function(obj, cb) {
    if (obj.e) {
      console.error('SocketStream RPC server error:', obj.e.message);
    } else {
      cb.apply(cb, obj.p);
    }
  };

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

    client.write(msg, cb);

    // Always return 'undefined'      
    return void 0;
  };

}