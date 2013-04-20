# Prism

**Warning: This is alpha software and subject to change. Feedback appreciated.**

Prism is a new high-performance realtime (WebSocket) server for Node.js. Use it to power all manner of realtime web applications including analytics dashboards, games, trading terminals and much more.

Connect to the server from the browser (or remote Node process) using [prism-client](https://github.com/socketstream/prism-client).


Note: Prism is **just** a standalone realtime server, nothing else.
SocketStream 0.4 will use Prism to offer a fully integrated end-to-end experience.


## Example

```js
var prism = require('prism');
var engineio = require('rtt-engineio')();

var server = prism({port: 3001, transport: engineio});

// Add a Realtime Service called "rpc"
server.service('rpc', require('rts-rpc')());

server.start();
```

[View more examples](examples)

### Features

* designed for speed and scalability (see benchmarks below)
* no core functionality - everything is provided by modular Realtime Services
* use native WebSockets, Engine.IO, SockJS, or any other Realtime Transport
* the client runs in the browser or a separate Node process
* share sessions between Prism and Express.js (thanks to Connect Session Store)
* swap to Connect Redis Store (or similar) when you want to scale out
* generates a custom client module containing all the code you need for the browser
* prevent DDOS attacks and drop malicious messages with Connect-style middleware
* super-efficient protocol to reduce bytes over the wire (doesn't force JSON)
* optionally returns errors to the client for easy debugging
* shared event bus so your app can react to client disconnects
* ultra-light client-side code (for sending to browser)


## API

[View API documentation](API.md) (generated from source code)


## Truly Modular

Prism uses Realtime Services, a new vendor-neutral to provide your app with PubSub, RPC, Realtime Models functionality and more. Realtime Services can be easily written, tested and shared on `npm`. Best of all they know nothing about Prism, so you can write your application code without any vendor lock in.

Use a mix of Realtime Services to get the exact functionality your app needs. Prism automatically handles the message multiplexing for you using minimal bytes and CPU.


## Connecting from the browser

Once you've added your transport and services, generate a custom client module:

```js
var client = server.buildClient({});
fs.writeFileSync('client.js', client, 'utf8');
```

The client contains all the client-side code you need based upon your choice of transport and services (minus any libraries which sadly can't be wrapped as Common JS modules - see Browser Assets below).

Require the client you've just built your application's client-side code as so:

```js
var app = require('./client')();
app.connect(function(err, info) {
  console.log('Connected to the server!', info);
  console.log('You can now call this API in your client code:', app.api);
});
```

Take this file, [browserify](https://github.com/substack/node-browserify) it, [minimize](https://github.com/mishoo/UglifyJS2) it and host it on a CDN.

See [examples](examples) directory or the `prism-client` Readme for more info.


## Sessions

Prism supports sessions using the Connect Session Store, allowing full compatibility with Express.js.

By default we use the in-memory store. This is fine for development, but not in production. Switch to a scalable session store (e.g. Connect Redis) with:

```js
var app = new Server({
  root:           __dirname,
  transport:      engineio,
  sessionStore:   new RedisStore({port: 6379})
});
```

## Scaling

The recommended way to scale Prism is behind a proxy such as HAProxy or Nginx (which now supports WebSockets).

Prism requires the load balancer to support 'sticky sessions', ensuring subsequent connections from the same browser (identified by the `connect.sid` cookie) are routed to the same backend server. This gives a huge performance boost as all session data can be cached in RAM (although any changes are always saved back to the Session Store).

Alternatively, you're able to route all incoming requests to any backend server you please. However, under this setup you'll have to disable in-memory session caching (with `cacheSession: false`). This will force Prism to query the Session Store on each incoming message. This will naturally be much slower, unless the Session Store is intelligently caching data locally.


## Request Middleware

As incoming requests hit the server, you are able to inspect them, drop them or transform them before they are sent on to the relevant Realtime Service for processing. For performance reasons this functionality is implemented as middleware, exactly like in Express.

Available middleware modules:

[**prism-rate-limiter**] - limits requests per second to help protect against DOS attacks

Use middlware as so:

```js
server.use(require('prism-rate-limiter')());

```


## Browser Assets

**Caution: This is the area of Prism which is most likely to change in the future!**

Transports and Services often need to send assets to the browser (e.g. a service which works with Backbone may want to send `backbone.min.js` to the client). Unless you're using SocketStream 0.4, you'll need to handle this manually by transforming this list into something your build system can use.

To obtain a list of static assets to send, call:

```js
app.browserAssets();
```


## Logging

Prism is silent by default. To turn on logging of each incoming request, pass `console.log` (or your own custom logger) to the server on startup:

```js
var app = new Server({
  port:           3001,
  transport:      engineio,
  log:            console.log
});
```

## FAQs

### Why not use Transform Streams instead of Connect-style middleware?

I tried this initially. Not only are they more complex to implement, they are MUCH slower (almost 10 times) than middleware. 


## Benchmarks

Install dev dependencies then run them with `npm run benchmarks'.

On a 2009 iMac, output is currently as follows:


    Benchmark 1: Simple echo service
    ✓ Requests per second: 124000

    Benchmark 2: Simple echo service (with JSON)
    ✓ Requests per second: 61000

    Benchmark 3: Simple echo service (with callbacks)
    ✓ Requests per second: 69000

    Benchmark 4: Simple echo service (with sessions from cache)
    ✓ Requests per second: 75000


Note: While the numbers are not bad, I think we can do better.
If it is necessary to change the internal APIs to improve performance I
will do so before Version 1 is released. Contributions / thoughts appreciated.


## License 

MIT
