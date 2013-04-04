# Realtime Service

An open standard describing a mix of client and server-side code designed to communicate over a persistent connection. This is usually a WebSocket connection, but any Realtime Transport module is compatible.

Each service is defined in the simplest possible way: as a standard JavaScript object. They can be loaded into servers which implement Realtime Services, such as socketstream-server.

Realtime Services are designed to be very easy to understand, write, test and share on `npm`.

Here's a simple example:

```js
var service = {
  client: function(client) {
    client.onmessage = function(msg) {
      console.log('Message in from server:', msg);
    }
  },

  server: function(server) {
    setInterval(function(){
      server.broadcast('Hello!');  
    }, 1000);
  }
}
```

### Examples Services

rts-rpc
rts-pubsub
rts-livereload


### Features

* super-simple: services are just JavaScript objects
* provides separate APIs for the client and server
* easy to write tests
* realtime-service-client can run in a browser or separate node process
* each service has it's own directory to store files (e.g. model definitions)
* efficiently handles callbacks, even for non-JSON messages
* services can optionally use sessions (provided by the server)
* server is notified when client connect/disconnect (allowing cleanup)
* services can send JavaScript assets to the browser
* optionally handles JSON encoding/decoding for you
* provides a standard logging API
* ultra light weight client-side code (for sending to browser)


Service do not care about:

* the underlying transport layer (abstracted away by Realtime Transport)
* how code is delivered to the browser (left to the framework or app)


### Implementations

Realtime Services are currently implemented in SocketStream 0.4. 

As other frameworks / toolkits implement them, they will be listed here.


### Contents

Realtime Services consist of

1. This - the server-side library
2. The `realtime-service-client` module
3. The Realtime Server Spec (TODO)


### API

TODO


## History

Realtime Services are the evolution of an idea called "Request Responders" which first appeared in SocketStream 0.3. Despite a horribly clunky API, the idea proved to be popular with modules for Backbone and Angular soon appearing. I knew I was on the right path.

Realtime Services will live at the very heart of SocketStream 0.4. However, I hope by ensuring the spec is a simple as possible (with minimal dependencies), other frameworks will support Realtime Services in the future. The ultimate goal is an ecosystem of reusable components using 100% standard `npm` packages.


## FAQs

#### Can I use Realtime Services with something other than SocketStream?

Absolutely! Please let us know if you do.

