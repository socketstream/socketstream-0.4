# SocketStream Realtime Server

A simple way to build high-performing realtime web applications that scale.

Combine multiple Realtime Services to provide PubSub, RPC, Realtime Models functionality and much more.

Connect to the server from the browser (or remote Node process) using socketstream-client.


### Example

```js
var Server = require('socketstream-server');
var engineio = require('rtt-engineio')({port: 3001});

var app = new Server({root: __dirname, transport: engineio});

// Add a Realtime Service called "rpc"
app.service('rpc', require('rts-rpc')());

app.start();
```

### Features

* designed for speed and scalability
* all functionality provided by modular Realtime Services
* transport agonostic - use Engine.IO, SockJS, or any Realtime Transport
* the client runs in the browser or a separate Node process
* sessions provided by in-memory Connect Session Store (compatible with Express.js)
* swap to Connect Redis Store (or similar) when you want to scale out
* provides a standard logging API
* ultra-light client-side code (for sending to browser)


Most applications will require several Realtime Services simultaneously - such as pubsub, rpc, livereload, realtime model syncing, user presence and more. You are free to add as many as you like. Messages are automatically multiplexed over the websocket using minimal bytes and CPU.

While the client will typically be a web browser, the socketstream-client module may also run on a remote Node process.


### Implementations

SocketStream Server and Client are implemented in the SocketStream 0.4 realtime web framework. 

As other frameworks and toolkits implement them, they will be listed here.


### Client-side Assets

Realtime Services often need to send assets to the browser (e.g. a service which works with Backbone may want to send `backbone.min.js` to the client). How you choose to do this is up to you.


### Sessions

SocketStream Server supports sessions using the Connect Session Store, allowing full compatibility with Express.js.

By default we use the in-memory store, but you should tell SocketStream to use a scalable session store (like Connect Redis) when running in production with:

```js
var app = new Server({
  root:         __dirname,
  transport:    engineio,
  sessionStore: new RedisStore({port: 6379})
});
```

By default we assume you want to use Sticky Sessions. This means if you open a new browser tab, or the connection drops and needs to reconnect, you will always be routed back to the same application server. Most load balancers support this. The major advantage this gives is performance as all session data can be cached in RAM for a fixed period of time.

Alternatively, you're able to route all incoming requests to any backend server you please. However there is a high performance price to be paid: The Session Store will need to be queried upon each incoming message. To ensure this happens, disable the local session cache with the `{cacheSessions: false}` option when starting the server.