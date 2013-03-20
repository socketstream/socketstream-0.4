# Realtime Service API

*** Warning: This spec will evolve over the coming months ***

An open standard for creating simple 'services' which are:

* high performing
* reusable
* testable
* sharable (on `npm`)

Realtime Services (RTS) define client and server code designed to work together.

They run over a WebSocket to provide:

* realtime model syncing
* rpc and pubsub
* user presence
* gaming
* news feeds
* and much more!

Realtime Services are currently implemented in SocketStream 0.4. 

As other frameworks / toolkits implement them, they will be listed here.


### Examples

rts-rpc
rts-pubsub
rts-livereload


### Features

* super-simple: services are defined as JavaScript objects
* designed for speed and raw throughput
* provides separate APIs for the client and server
* each API is added to a shared `api` object (easily passed around)
* handles JSON encoding/decoding and callbacks for you
* easy to write tests
* send JavaScript code to the client (as libs or modules)
* provide a standard logging API
* ultra-light client-side code (for sending to browser)

And coming soon....

* send and receive strings or binary data
* use services over a TCP connection from another Node process

Everything is optional! Use only what you need.

Service do not care about:

* the underlying transport layer
* how data is multiplexed over the websocket
* how code is delivered to the browser

These problems are solved higher up by the framework or app.


### Contents

Realtime Services consist of

1. This - the server-side library
2. The `realtime-service-client` module (separated for Browserify)
3. The Realtime Server Spec (TODO)


### API

TODO


## History

Realtime Services are the evolution of an idea called "Request Responders" which first appeared in SocketStream 0.3. Despite a horribly clunky API, the idea proved to be popular with modules for Backbone and Angular soon appearing. I knew I was on the right path.

Realtime Services will live at the very heart of SocketStream 0.4. However, I hope by ensuring the spec is a simple as possible (with minimal dependencies), other frameworks will support Realtime Services in the future. The ultimate goal is an ecosystem of reusable components using 100% standard `npm` packages.


## FAQs

#### Can I use Realtime Services with something other than SocketStream?

Absolutely! Please let us know if you do.



