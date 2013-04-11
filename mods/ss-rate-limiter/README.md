# Rate Limiter for SocketStream Server

This very basic rate limiter prevents sockets from flooding the server with multiple requests per second (easy to do on the client if you use a while loop in the JS console).

This module is also a good example of how to create SocketStream Server middleware.


### Example Usage

```js
// in your SocketStream server config
app.server.use(require('ss-rate-limiter')({maxRequestsPerSecond: 12})); // default = 8

```

### How it works

The middleware counts each incoming request for every `socketId`. Normally requests are just passed through, however if the client has exceeded its allocation, we send a warning (visible in the browser's console) and drop the message.

The warning will only be sent once. All subsequent requests will be silently dropped.

The request counter is reset every second.


### TODO

* Add an option to drop all future traffic from an offending client
* Ability to whitelist hosts


### Tests

    mocha


### License

MIT