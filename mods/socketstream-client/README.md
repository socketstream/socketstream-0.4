# SocketStream Realtime Client

Connect to a SocketStream Realtime Server from the browser or a remote Node app.

### Example

```js
var Client = require('socketstream-client');
var engineio = require('rtt-engineio')();

var transport = engineio.client({port: 3001, host: 'localhost'});
var app = new Client();

app.connect(transport, function(err, info){

  console.log("Connected to SocketStream Server %s with Session ID %s", info.version, info.sessionId);
  
  app.discover({}, function(){
    console.log('Available services are', app.api);
  });

});
```


### Connecting from another Node process

Please see the REPL client example in `examples/repl.js`.



### Providing Services

A SocketStream Server will usually be running one or more Realtime Services.

Each Service will probably (but not always) contain code to be run on the client (accessible via the `app.api` object).

Client's can either be told what services are available in advance, or discover them upon connection by asking the server.

We recommending providing service info in advance wherever possible as this minimizes the traffic over the WebSocket. It also allows for the client-side code to be minimized and served by CDNs.

However it's not always possible to know what Services are provided by a server until you connect. For example, you may want to run a query over the REPL against a remote server. In this instance, you may call `client.discover()` upon initial connection.
