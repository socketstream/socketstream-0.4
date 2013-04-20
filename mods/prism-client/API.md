# Prism Client API

  - [Client()](#client)
  - [Client.provide()](#clientprovide)
  - [Client.load()](#clientload)
  - [Client.discover()](#clientdiscover)
  - [Client.process()](#clientprocess)
  - [Client.connect()](#clientconnect)
  - [Client._getSessionId()](#client_getsessionid)
  - [Client._setSessionId()](#client_setsessionid)

## Client()

  Prism Client
  
  Example:
  
```js
  var prism = require('prism-client');
  var client = prism({
    root:          '/my/app/dir',
    dir:           'services',
    log:           console.log,
    transport:     require('rtt-engineio')(),
    events:        instanceOfAnEventEmitter,
    sessionStore:  new RedisStore({port: 6379}),
    cacheSessions: true
  });
```

## Client.provide()

  Provide details of a service running on the server (saves needing to discover)

## Client.load()

  Load all services in from an Array (used when testing on the server)

## Client.discover()

  Discover which services are available and download the client-side code from the server.

## Client.process()

  Process an incoming message string

## Client.connect()

  Attempt to connect. When successful, transmit sessionId

## Client._getSessionId()

  Attempt to get session ID from cookie

## Client._setSessionId()

  Set new session ID cookie
