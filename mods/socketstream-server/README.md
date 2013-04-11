# SocketStream Realtime Server

A simple way to build high-performing realtime web applications that scale.

SocketStream Server allows you to combine multiple Realtime Services together to provide your app with PubSub, RPC, Realtime Models functionality and more.

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

* designed for speed and scalability (see benchmarks below)
* all functionality provided by modular Realtime Services
* connect using raw WebSockets, Engine.IO, SockJS, or any other Realtime Transport
* the client runs in the browser or a separate Node process
* sessions provided by in-memory Connect Session Store (compatible with Express.js)
* swap to Connect Redis Store (or similar) when you want to scale out
* inspect, transform and drop incoming requests with Connect-style middleware
* provides a standard logging API
* returns errors to the client (in development mode) for easy debugging
* ultra-light client-side code (for sending to browser)


Most applications will require several Realtime Services simultaneously - such as pubsub, rpc, livereload, realtime model syncing, user presence and more. Add as many to the server as you like with the `app.service()` command. Messages are automatically multiplexed over the websocket using minimal bytes and CPU.

While the client will typically be a web browser, the socketstream-client module may also run on a remote Node process.


### Implementations

SocketStream Server and Client are implemented in the SocketStream 0.4 realtime web framework. 

As other frameworks and toolkits implement them, they will be listed here.


### Session Store

SocketStream Server supports sessions using the Connect Session Store, allowing full compatibility with Express.js.

By default we use the in-memory store. This is fine for development, but not in production. Switch to a scalable session store (e.g. Connect Redis) with:

```js
var app = new Server({
  root:           __dirname,
  transport:      engineio,
  sessionStore:   new RedisStore({port: 6379}),
  cacheSessions:  true
});
```

### Caching Sessions

The `cacheSessions: true` option above works well if you're using 'Sticky Sessions'. Sticky Sessions mean a load balance must sit in front of your app servers to ensures subsequent connections from the same browser (identified by the `connect.sid` cookie) are routed to the same backend server. This gives a huge performance boost as all session data can be cached in RAM (although any changes are always saved in the Session Store).

Alternatively, you're able to route all incoming requests to any backend server you please. However, under this setup you'll have to disable in-memory session caching (with `cacheSession: false`), which will force SocketStream Server to query the Session Store on each incoming message. This will naturally be much slower, unless the Session Store is intelligently caching data locally.


### Request Middleware

As incoming requests hit the server, you are able to inspect them, drop them or transform them before they are sent on to the relevant Realtime Service for processing.

This functionality is implemented as middleware, exactly like in Express.

Available middleware modules:

`ss-rate-limiter` - limits requests per second to help protect against DOS attacks

Use middlware as so:

```js
server.use(require('ss-rate-limiter')());

```


### Browser Assets

Realtime Services often need to send assets to the browser (e.g. a service which works with Backbone may want to send `backbone.min.js` to the client). If you're using the SocketStream 0.4 framework this is done automatically. However, if you're using `socketstream-server` on it's own, you'll need to handle this manually by transforming this list into something your build system can use.

To obtain a list of static assets to send, call:

```js
app.browserAssets();
```


### Benchmarks

Run them using `npm run benchmarks'.

On a 2009 iMac, output is currently as follows:

```
Benchmark 1: Simple echo service
✓ Requests per second: 124000

Benchmark 2: Simple echo service (with JSON)
✓ Requests per second: 61000

Benchmark 3: Simple echo service (with callbacks)
✓ Requests per second: 69000

Benchmark 4: Simple echo service (with sessions from cache)
✓ Requests per second: 75000
```

Right now the immediate priority is to lock down the API.
Work will go into performance tuning shortly. Contributions appreciated.


### Licene

MIT