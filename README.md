# SocketStream 0.4

**Current Status: Pre-alpha**

SocketStream is a Node.js Realtime Web Framework with a focus on high performance and extensibility.

[View Latest Changes](https://github.com/socketstream/socketstream-0.4/blob/master/HISTORY.md)


## April 2013 Update

After three releases, two years of experimentation and over 2500 followers on github, SocketStream is no longer a proof of concept.

We know people love the ideas in previous versions and want to build solid, scalable realtime apps this way. That's why a lot work is underway to make everything production-ready and simpler to maintain in the long term.

To achieve this we're dividing up the various components that make up SocketStream into smaller, standalone modules. The result will be a much simpler framework which will provide value to those who like some of the ideas in SocketStream, but don't want to buy into the entire stack.

Once this process is complete, SocketStream (the framework) will contain little or no code. It will simply integrate other modules in an (even more!) opinionated way to get you up and running instantly using best practices. However, unlike other realtime frameworks out there, you'll always retain the freedom to change any part of the stack later down the line.


## Progress so far

The first major module to be released as a standalone project is [**Prism**](https://www.github.com/socketstream/prism), the realtime server powering SocketStream 0.4. Coming soon will be **Spa** - our solution to managing client assets in a Single Page Application.

Even though things are moving rapidly, you should always be able to run the example app (see below for instructions). Please note: If you're looking for something stable and reasonably mature, please continue to use SocketStream 0.3 until further notice.


<hr>

## Introduction

Do you want to be up and running in minutes with a framework that tells you exactly what to do? Or do you prefer lots of small modules you can customize as your needs change? SocketStream 0.4 aims to give you the best of both.

Start off with our opinionated end-to-end framework which tells you exactly where to put your files, how to write your client-side code, and infuses "best practices" derived from years of experience in this space.

Should your needs change in the future, you'll find SocketStream 0.4 is composed of many smaller modules you can use on their own, or in combination with other modules on `npm`, to give you the custom tech stack of your dreams.


## Why Choose SocketStream

Integrating all the bits you need to make a high-performing, scalable realtime web app is hard.

At one end of the scale there's Meteor: a great all-in-one solution, but one that forces you to do everything their way or the highway. At the opposite end is the myriad of individual Node modules which can be plugged together to create the tech stack of your dreams - but this takes a lot of time, knowledge and patience.

Somewhere in the middle of these two extremes lies SocketStream. A modular and highly extensible framework which integrates best-of-breed modules to solve common problems. We take care of all the boring stuff (serving client code as modules, session, asset packing, etc) so you can dive straight in and start creating your app.

Add whatever functionality your app needs (e.g. RPC, PubSub, Realtime Models) by combining Realtime Services together, then take advantage of our slick build system which wires up everything on your behalf. Best of all, everything is implemented as standalone `npm` modules, so you're free to change any part of the stack in the future without having to start from scratch.


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


## API & Tutorial

Updated versions coming soon. See the example app for now.


## FAQs

**Q: How does SocketStream compare to Meteor?**

Both SocketStream and Meteor are designed to get you up and running quickly. While Meteor most definitely wins when it comes to instant realtime models and deployment, SocketStream admittedly takes a little bit longer to understand how the various pieces fit together.

However, if you're prepared to put in the initial effort, you'll be rewarded with much greater flexibility, true NPM support, optional Express integration, 100% Node Core conventions (no fibers), and a choice of ways to store your data (not just Mongo).

Better still, as the SocketStream framework is simply a collection of individual modules, if you decide later that you don't like something (e.g. our asset build system), it's very easy to use something else (like Grunt) instead. Use as little or as much of the SocketStream ecosystem as you want. 


**Q: How does SocketStream compare to Socket.IO?**

Socket.IO is a fantastic simple realtime framework which offers pubsub and channel support. SocketStream doesn't include any functionality like this in the core, instead it uses modular Realtime Services to provide RPC, PubSub and much more - including Realtime Models. SocketStream also offers the ability to run on multiple transports (including Engine.IO, as used by Socket.IO), a session store that works with Express apps, and a way to intercept incoming messages before they are processed.


**Q: How does SocketStream compare to SockJS?**

SockJS is just a websocket transport with fallbacks. You can use it with SocketStream without changing any of your application code.


**Q: Can I use SocketStream with PhoneGap?**

Yes. You will probably need to use [Persist.js](https://github.com/jeremydurham/persist-js) to handle the sessions cookies. We've not tried this ourselves yet, but when we do we'll publish a full guide.


**Q: What are the major changes since 0.3?**

* Everything separated into standalone modules
* Asset Server and Realtime Server can now run in separate processes
* Vanilla JavaScript for maximum readability
* Request Responders are now called Realtime Services, a new vendor-neutral open standard
* Live Reload, PubSub and RPC are now implemented as optional Realtime Services
* No need to structure your app dir in a particular way (though still recommended!)
* More emphasis on providing an API and Tutorial and less on generating / modifying files
* Asset tags are now injected into HTML automatically
* Supports multiple instances
* No longer logs to `console.log` by default



## License 

(The MIT License)

Copyright (c) 2000 - 2013 Owen Barnes &lt;owen@socketstream.org&gt;

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
