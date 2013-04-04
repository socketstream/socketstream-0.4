WARNING: At this point *everything* is in flux and may change - drastically.
Generally the `/example_app` should always be working.

0.4.0experimental4 / 2013-04-04
===============================

#### Standalone Realtime Server and Client

* Created new library: socketstream-server. This is the pure realtime server without any client asset stuff
* socketstream-client can now run in a Node app, as well as the browser (try the repl.js example in socketstream-client)
* socketstream-client can now discover what services are available on the server and download code over the WS
* Callbacks are now encoded as message attributes (faster and better than forcing JSON)
* Services can now respond to clients disconnecting

#### Sessions

* socketstream-server and client now support cookie-based Sessions where available
* sessions are only fetched if the service asks for it (with `{use: {sessions: true}}`)
* 'connect.sid' is the default cookie name to preserve compatibility with Express
* Sessions are cached in RAM by default. Greatly speeds things up when using Sticky Sessions
* Alternatively disable `cacheSessions` and the session store will be queried on each request

#### Transports

* Added SockJS Realtime Transport (rtt-sockjs). Works just as well as rtt-engineio 
* Both transports now attempt to reconnect if the server goes down

#### Other

* SocketStream no longer sends `json.min.js`. Please add your own json shim if you want to support old browsers
* Got rid of ss-message-parser - now performed higher up when we parse msg attributes
* Subscribing to channels (for pubsub) not implemented yet


0.4.0experimental3 / 2013-03-20
===============================

#### New Realtime Service API

* Everything to do with Services has been extracted out into the realtime-service and realtime-service-client modules. These modules are used by SocketStream 0.4 but no longer depend on it. The /mods/realtime-service/README.md file explains all.
* Realtime Services will be promoted as a new open standard for reusable, testable modules that contain client AND server code designed to work well together over a WebSocket. It is hoped other frameworks will implement this standard in the future.
* `rpc`, `pubsub` and `livereload` are now implemented as RTS modules.
* Lots of other improvements around Services. Plenty more to come. I'll be talking about Realtime Services extensively at RealtimeConf EU in April.



0.4.0experimental2 / 2013-03-13
===============================

#### Changes to Streams

* Removed Streams in favor of callbacks & middleware. As much as I like the new Streams2 API, it's far slower and more complicated than using standard middleware and callbacks. My quick and dirty benchmarks (look in /benchmarks/streams2-vs-middleware) show Streams2 as 10x slower at processing a typical SocketStream incoming message. This is totally unacceptable. If you can find any way to speed this up, I'd love to hear from you!
* Very keen to reintroduce Streams in the future if there are clear advantages in doing so (memory management maybe?), but performance and throughput must not suffer as a result. I will continue testing and benchmarking
* The code is now a lot smaller, simpler and more understandable. The amount of code we send to the browser (minimum SocketStream boiler plate) has also been significantly reduced (Streams1 is over 5kb when minified)
* For those of you still wanting to pipe() data to and from the browser, I've made a start on an optional ss-stream Service Module. If you start the example app, you'll see a fake tweet being pushed to the browser every 5 seconds. Lots of work still to do here


#### Services API (Request Responders in 0.3)

* All services which we previously bundled (`rpc`, `pubsub`, `livereload`) have been extracted out of the core and have been placed in`/mods` for now. They will eventually be published to NPM and have their own individual tests. The new `peerDependencies` option in NPM will help here
* The Service API now provides Callbacks and JSON Serialization, so you won't need to think about creating your own callback stack when creating a Realtime Models module, etc. The implementation still needs to be improved
* Each Service can only have one name which will now be the same across frontend and backend. This means `ss.publish` on the server and `ss.events` on the client are now `ss.pubsub`. You'll easily be able to alias the old names manually to avoid changing your 0.3 code.
* `ss.env` and other Service config is now being passed through to the client
* Improved logging. Now shows user-defined name in output


#### Other changes

* The Asset Server (which may well be Express) and the Realtime Server now run in seperate processes (which means separate ports on localhost) by default. This makes it easier to scale out Asset Servers and WebSocket Servers independently. There's nothing to stop either the Transport module or your front end server using `cluster` in the future, but it won't be in the core
* We now use Browserify 2 to send all module code. This will (shortly) include full source map support as an alternative to sending every file individually in dev mode.
* As Browserify2 no longer allows modules to be `require`'d after the initial build, we must put all our system config code (for the transport, services, etc) into a file (currently `/example_app/client/app/system.js`) and require this at build time. Whilst this file can be cached in the future, I still need to think through the pros and cons of this entirely new approach
* Improved compatibility with Express by inverting the coupling. Express now consumes SocketStream with `app.use(ss.connectMiddleware())`. This approach is much cleaner and less lightly to break in the future
* Core code now uses strict mode and is linted correctly. After experimenting with ASI I've decided against it


#### Immediate Priorities

* Find a better way to store and serve client-side code for Services and the Transport. It sucks right now
* Continue improving ServerManager, Service, and Transport API design. This is the hardest but most critical thing to get right!
* Find a common way for Services, Transport and other future plugins to deliver assets (JS libs, and other code), to the client
* Lots of refactoring / rethinking around Single Page Clients
* Re-implement Middleware in `ss-rpc` to make it 100% compatible with 0.3 code
* There will always be a way to use SocketStream as a standalone lib without Connect, but I'm increasingly thinking about offloading static asset file serving and other tasks to Express or other modules and taking this functionality out of SocketStream core
* Start working on Sessions
* Decide what to do with `jade-stream` and `stylus-stream` modules

Help with any of the items above would be gratefully received



0.4.0experimental / Late 2012
=============================

* First attempt at improving SocketStream 0.3
* Uses streams(1) everywhere
* Uses muxdemux to multiplex streams