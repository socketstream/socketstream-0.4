# SocketStream 0.4 Early Experimentation

SocketStream is a Realtime Web Framework with a focus on high performance and extensibility.

[View Latest Changes](https://github.com/socketstream/socketstream-0.4/blob/master/HISTORY.md)


## What's going on here?

I'm releasing previews of 0.4 as it takes shape over the coming months. While the code here is incomplete and subject to change, you should always be able to run the example app (see below for instructions).


## Goals

* high performance
* minimal bandwidth
* reliability at scale
* easy to get started
* transport agnostic
* minimal client-side code
* excellent mobile compatibility
* idiomatic Node.js code style throughout
* lazy-load only the parts you choose to use
* chooses simplicity and high performance over SEO compatibility
* provide APIs to support Models, Presence and more (as Stream Services)
* only absolute essentials live in the core
* personal tastes (e.g. CoffeeScript) supported via optional modules


## New Modular Design

The SocketStream framework is a 'meta module' which integrates the following standalone modules for maximum productivity:

**[socketstream-server](https://github.com/socketstream/socketstream-0.4/blob/master/mods/socketstream-server/README.md)** SocketStream Realtime Server. Responds to requests over websockets
**[socketstream-client](https://github.com/socketstream/socketstream-0.4/blob/master/mods/socketstream-client/README.md)** SocketStream Realtime Client. Connect to the server from the browser or other Node process

TODO: Separate out Single Page Client and Asset Building.


## What's working so far?

Right now we have basic client-side asset serving (excluding templates) working. We also have basic PubSub, RPC and Live Reload working over the websocket. These are all implemented as Realtime Services (the new name for Request Responders), however the API will need to change to allow each service to be tested. There are many big problems still to solve such as how best to do sessions, auth, and connection status. Expect frequent commits.

If you see a better way to architect or design something, **please** let me know or submit a pull request. Nothing is set in stone at this stage and my primary concern is getting the design right for the long term.


## Why SocketStream

Integrating all the bits you need to make a high-performing, scalable realtime web app is hard.

At one end of the scale there's Meteor: a great all-in-one solution, but one that forces you to do everything their way or the highway. At the opposite end is the myriad of individual Node modules which can be plugged together to create the tech stack of your dreams - but this takes a lot of time, knowledge and patience.

Somewhere in the middle of these two extremes lies SocketStream. A modular and highly extensible framework which integrates best-of-breed modules to solve common problems. We take care of all the boring stuff (serving client code as modules, session, asset packing, etc) so you can dive straight in and start creating your app.

Add whatever functionality your app needs (e.g. RPC, PubSub, Realtime Models) by combining Realtime Services together, then take advantage of our slick build system which wires up everything on your behalf. Best of all, everything is implemented as standalone `npm` modules, so you're free to change any part of it in the future without having to start from scratch.


## Warning

**0.3 users:** Don't be alarmed. What you see here is completely unfinished and missing many of the essential features present in SocketStream 0.3. They will return over the coming weeks.

**New users:** If you're looking for something stable and reasonably mature, please use SocketStream 0.3 until further notice.

Note: I've deliberately put this code in a new repo so we can discuss crazy new ideas in Github Issues without scaring or confusing existing 0.3 users. I'll move the code over to the `master` branch of the main repo when I feel the API is relatively stable and the overall design is sound.


## Try it out

Early adopters and hackers only for now!

```bash
git clone https://github.com/socketstream/socketstream-0.4
cd socketstream-0.4
[sudo] npm install
cd mods
./npm_link_all.sh
cd ..
```

Then run the example app (there's no app generator yet)

```bash
cd example_app
./npm_link_all.sh
[sudo] npm install
node app.js
```

Note: Stylus and Jade won't be required to use SocketStream 0.4, nor will any of the other optional modules. They're just included in this repo to aid development for now.


## API

Create a new app instance with:

```js
var SocketStream = require('socketstream'),
    app = SocketStream();
```

### `app` Properties

* **app.version** _(String)_ : Version number taken from package.json
* **app.root** _(String)_ : Your application's root directory
* **app.env** _(String)_ : Environment name as passed by `NODE_ENV` (defaults to `development`)
* **app.log** _(Object)_ : Supply functions (such as `console.log`) to `debug`, `info` and `error`
* **app.eb** _(EventEmitter)_ : System Event Bus. Allows your app to listen out for events (e.g. client disconnects) and perform an action. Full documentation coming soon


### `app` Methods

#### Essentials

* **app.start**(httpServer) : **Start the Server**
  * Tells SocketStream to bind the websocket transport to the HTTP server and wire everything up
  * httpServer _(Object)_ : HTTP server instance to bind the websocket transport to
  * Returns _(Object)_ : a SocketStream server instance
* **app.transport**(module) : **Specify a websocket transport module**
  * Specify which WebSocket (or other persistent) transport should be used (e.g. Engine.IO)
  * module _(Function)_ : SocketStream-compatible wrapper around a transport
* **app.service**(moduleOrName, options) : **Use a Websocket Service Stream**
  * Each new Service establishes a full duplex stream on the client and server and can optionally send code to the client and return a server-side API
  * moduleOrName _(String)_ : When String, load an internal (bundled) Stream Service of that name
  * moduleOrName _(Object)_ : When Object, define a new Service by passing 'server' and 'client' functions
  * options _(Object)_ : Pass an options object to the Service


#### Single Page Clients

* **app.client**(viewPath, assetPaths) : **Define a new Single Page Client**
  * viewPath _(String)_ : file name of main `.html` (or `.jade` etc) file to be served
  * assetPaths _(Object)_ : specifies a list of assets to automatically serve (`css`, `mods`, `libs`) in the form of Arrays
  * Returns _(Object)_ : a Single Page Client object (API documented below)
* **app.preprocessor**(fileExtension, module) : **Add a Code Preprocessor (Formatter)**
  * Tells SocketStream to automatically pipe() files of `fileExtension` through `module` before output
  * fileExtension _(String)_ : a file extension (e.g. `jade`)
  * module _(Function)_ : any duplex stream (e.g. a streaming Jade parser)
* **app.serveAssets**(request) : **Respond to HTTP requests for Client Assets (JS, CSS, etc) and static files**
  * request _(Object)_ : a HTTP Request object
  * Returns _(Object)_ : a readable stream to be piped() to a HTTP response object


#### HTTP Router

* **app.route**(mountUrl, clientOrFunction) : **Add a new HTTP Route**
  * mountUrl _(String)_ : the URL for mounting this client (e.g. `/` or `/admin`)
  * clientOrFunction _(Function)_ : either an instance of a Single Page Client, or a function taking a `req` and `res` param
* **app.router**() : **Add a new HTTP Route**
  * Returns a very simple function that will recursively route incoming requests until a matching client (as specified with the `app.route()` function) can be found
  * Returns _(Function)_ : a function accepting `req` and `res` params, suitable for passing to `http.createServer()`


### `client` Methods

`app.client()` returns a new Single Page Client. This is the API

* **client.html**(request) : **Return the raw HTML (unprocessed)**
  * request _(HttpRequest)_
  * Returns _(Stream)_ : a stream of HTML which can be piped to `response`
* **client.serveAssets**(request) : **Serve CSS/JS assets**
  * request _(HttpRequest)_
  * Returns _(Stream)_ : a stream of CSS or JS which can be piped to `response`
* **client.serveStatic**(request, dir) : **Serve Static Files**
  * request _(HttpRequest)_
  * dir _(String)_ : root dir to serve static files from (e.g. `/client/public`)
  * Returns _(Stream)_ : a stream of static file data which can be piped to `response`
* **client.view**(request) : **Serve processed HTML**
  * This is the recommended way to serve HTML views. It injects tags and preprocesses the HTML if required
  * request _(HttpRequest)_
  * Returns _(Stream)_ : a stream of HTML which can be piped to `response`


## Tutorial

This is a step-by-step tutorial which shows you how each component of SocketStream can be combined together.

Tip: Create a new directory and a new file called `app.js`. Copy and paste each example to follow along.


#### 1. Web Servers 101

Let's start with the most basic web server you can build with Node:

```js
var http = require('http')

var server = http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(3000, '127.0.0.1');

console.log('Server running at http://127.0.0.1:3000/');
```

Nice and simple. But how do we go from this to a web server that can send different HTML, JS and CSS depending upon the URL and device connecting?

At the very heart of SocketStream is the concept of Single Page Clients.

While you may easily combine SocketStream with other multi-page frameworks, SocketStream is **only** concerned with delivering all the CSS, JS, HTML and Client-side Templates a single page app needs in one go (though we will support optional async loading of assets later on, as we did in 0.3).


#### 2. Defining a Single Page Client

Let's create a new SocketStream app and define our first Single Page Client:

```js
var http = require('http'),
    SocketStream = require('socketstream'),
    app = SocketStream();

// Define a Single Page Client
var mainClient = app.client('main.html');

// Start the HTTP server
var server = http.createServer(function (req, res) {
  mainClient.html().pipe(res)
}).listen(3000, '127.0.0.1');

console.log('Server running at http://127.0.0.1:3000/');
```

Here we have:
  
  1. Created a new Single Page Client based upon the HTML found in 'main.html'
  2. Piped the raw HTML to the HTTP `res` (response) object

To try this example, create a file called `main.html` in your project directory, and paste in the following:

```html
<html>
  <head>
    <title>SocketStream Tutorial</title>
  </head>
  <body>
    <h1>Hello World!</h1>
  </body>
</html>
```

Then run your app with `node app.js` and visit `http://localhost:3000`. You should see Hello World! on the screen.

By creating multiple Single Page Client's you're able to easily serve different assets to different devices, or on different URLs, without duplicating files. 


#### 3. Delivering Assets

HTML is all well and good, but a Single Page App needs CSS, client-side JS, and other assets to function.

These can be defined by passing an object to the second argument of `app.client()` containing a list of files to be sent whenever this client is served.

SocketStream ensures assets are loaded in the most optimal order, allowing files to be easily debugged in development and packed & cached in production (yet to be implemented in 0.4).

Update your code now to include a CSS file called `main.css`:

```js
// Define a Single Page Client
var mainClient = app.client('main.html', {
  css: ['main.css']
});
```

And create the `main.css` file in your project directory:

```css
body {
  background-color: #BBBBFF;
  font-family: sans-serif;
}
```

List as many CSS files as you want. If you pass the name of a directory, all files inside will be served alphanumerically.

We're almost done, but we need to tell SocketStream to:

1. Inject asset tags into the HTML view (in the most optimal order)
2. Watch out for incoming requests for asset files and serve them

Hence our final code now looks like:

```js
var http = require('http'),
    SocketStream = require('socketstream'),
    app = SocketStream();

// Define a Single Page Client
var mainClient = app.client('main.html', {
  css: ['main.css']
});

// Start the HTTP server
var server = http.createServer(function (req, res) {

  if (req.url === '/') {
    mainClient.html()
      .pipe(mainClient.injectAssetTags())
      .pipe(res);
  } else {
    app.serveAssets(req).pipe(res);
  }

}).listen(3000, '127.0.0.1');

console.log('Server running at http://127.0.0.1:3000/');
```

Run `node app.js` again and note the pale blue background color.


#### 4. Streams Everywhere!

Before we clean up this code, it's worth stating that Single Page Clients output data in the form of standard Node Streams.

This means you can easily pipe() the HTML to another output interface:

```js
mainClient.html().pipe(process.stdout);  // outputs the HTML to the terminal
```

Or pipe it through code pre-processors:

```js
var jade = require('jade-stream'); // a simple streaming wrapper around Jade
mainClient.html().pipe(jade()).pipe(res);
```

Or even gzip the output. Altogether now:

```js
var jade = require('jade-stream'),
    oppressor = require('oppressor'); // thanks SubStack!

var server = http.createServer(function (req, res) {

  mainClient.html()
    .pipe(jade())
    .pipe(mainClient.injectAssetTags())
    .pipe(oppressor(req))
    .pipe(res);

}).listen(3000, '127.0.0.1');
```

So if you need this level of ultra-fine grain control for your app, you'll always have it.


#### 5. Tidying Up

As pre-processing and gzip compression are things we believe are **essential for every web app**, we've created a nifty helper method called `view()` which does this all for you, in the right order, automatically.

```js
var http = require('http'),
    SocketStream = require('socketstream'),
    app = SocketStream();

// Define Code Preprocessors
app.preprocessor('jade', require('./jade-stream')());

// Define a Single Page Client
var mainClient = app.client('main.jade', {  // note we're using Jade in this example
  css: ['main.css']
});

// Start the HTTP server
var server = http.createServer(function (req, res) {

  if (req.url === '/') {
    mainClient.view(req).pipe(res);
  } else {
    app.serveAssets(req).pipe(res);
  }

}).listen(3000, '127.0.0.1');

console.log('Server running at http://127.0.0.1:3000/');
```

Note the new `app.preprocessor()` command. Here we're telling SocketStream to always stream the output of `.jade` files through the `jade-stream` module (a simple wrapper we've built until Jade supports Streams), thus outputting HTML.


#### 6. HTTP Routing

Let's continue cleaning things up by introducing the basic HTTP router that's included in SocketStream.

You don't have to use it (feel free to use Express, mapleTree or another module for routing), but the SocketStream router provides a handy feature you're going to need to build a modern Single Page App: support for HTML5 PushState routing.

Let's assume you have defined two Single Page Clients `mainClient` and `adminClient`. You'd like `mainClient` to be served when visitors hit the root URL `/` and the internal `adminClient` if you visit `/admin`.

We can define these routes with the `app.route()` command as so:

```js
app.route('/', mainClient);
app.route('/admin', adminClient);
```

To ensure your app can make full use of PushState routing (as used by the Backbone Router), incoming URLs will be recursively matched until the correct route is found. E.g. a request for `/admin/products/123` will correctly serve the `/admin` client.

Let's wire this up by passing the `app.router()` function to `http.createServer()`. The completed code looks like:

```js
var http = require('http'),
    SocketStream = require('socketstream'),
    app = SocketStream();

// Define a Single Page Client
var mainClient = app.client('main.html', {
  css: ['main.css']
});

// Define Routes
app.route('/', mainClient);

// Start the HTTP server
var server = http.createServer(app.router()).listen(3000, '127.0.0.1');

console.log('Server running at http://127.0.0.1:3000/');
```

Note: `app.router()` will automatically send requests through to `app.serveAssets()` if a main route cannot be found.

Finally, how can we serve a different client depending upon the connecting device? Simply pass a function as so:

```js
app.route('/', function(req, res){
  if (req.headers['user-agent'].match(/iPad/)) {
    ipadClient.view().pipe(res);
  } else {
    mainClient.view().pipe(res);
  }
});
```


#### 7. Coming soon

That's all for now. I'm building the API Guide and Tutorial bit by bit as each section is complete and I'm reasonably happy with the API.

I will document the new `app.service()` command soon.



## Major changes since 0.3 so far

* Vanilla JavaScript for maximum readability
* Request Responders are now provisionally called Services
* Live Reload, PubSub and RPC are now implemented as bundled Services (all lazy-loaded)
* No need to structure your app dir in a particular way (though still recommended!)
* More emphasis on providing an API and Tutorial and less on generating / modifying files
* Asset tags are now injected into HTML automatically
* Supports multiple instances
* No longer logs to `console.log` by default


## License 

(The MIT License)

Copyright (c) 2012 Owen Barnes &lt;owen@socketstream.org&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
