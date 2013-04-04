/**
 *
 *  SocketStream Server Example
 *
 */

var Server = require('../index');
var rtt = require('../../rtt-engineio')({port: 3001});
var app = new Server({root: __dirname, transport: rtt});

// Add a Realtime Service called "rpc"
app.service('rpc', require('../../rts-rpc')());

app.start();

console.log(app.browserAssets());