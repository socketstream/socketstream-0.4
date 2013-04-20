# Prism Client

Connect to a Prism Server from the browser or a remote Node app.


### Example

```js
var prism = require('prism-client');
var engineio = require('rtt-engineio')();

var transport = engineio.client({port: 3001, host: 'localhost'});
var app = prism();

app.connect(transport, function(err, info){

  console.log("Connected to SocketStream Server %s with Session ID %s", info.version, info.sessionId);
  
  app.discover({}, function(){
    console.log('Available services are', app.api);
  });

});
```

### API

[View API](/API.md)


### Connecting from another Node process

Please see the REPL client example in `examples/repl.js`.

Note: Not all transports support this. `rtt-engineio` and `rtt-ws` do.


### Connecting from a PhoneGap app

I've not tried this yet, but in theory it should be possible. You may need to use [PersistJs](https://github.com/jeremydurham/persist-js). Please get in touch to let me know how you get on.


### Providing Services

A Prism server will usually be running one or more Realtime Services.

Each Service will probably (but not necessarily) contain code to be run on the client (accessible via the `app.api` object).

Client's can either be told what services are available in advance (using `app.provide()`), or discover them upon connection (using `app.discover()`).

We recommending providing service info in advance wherever possible as this minimizes the traffic over the WebSocket. It also allows for the client-side code to be minimized and served by CDNs.

However it's not always possible to know what Services are provided by a server until you connect. For example, you may want to run a query over the REPL against a remote server. In this case, you must call `app.discover()` upon initial connection.


### Licene

MIT