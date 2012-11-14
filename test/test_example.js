var assert = require('should');
var child_process = require('child_process');
var net = require('net');
var http = require('http');
var path = require('path');

// or pull node-portfinder as devDependencies?
var portrange = 45032

function getPort (cb) {
  var port = portrange
  portrange += 1

  var server = net.createServer()
  server.listen(port, function (err) {
    server.once('close', function () {
      cb(port)
    })
    server.close()
  })
  server.on('error', function (err) {
    getPort(cb)
  })
}

function testurl(url, cb) {
 var request = http.get(url, function(res) {
    if(res.statusCode < 200 || res.statusCode >= 400) {
      cb('Invalid return status code ' + res.statusCode);
    } else {
      var reply = '';
      res.on('data', function(d) {
        reply += d.toString();
        if(reply.indexOf('</html>') !== -1) {
          cb(null, reply);
        }
      })
    }
  })
 request.on('error', function(e) {
  cb(e);
 })
}

describe('example_app', function() {

  var PATH_TO_EXAMPLE = path.join(__dirname, '..', 'example_app/app.js')
  it('is runnable from the command-line', function(done) {
    getPort(function(port) {
      var app = child_process.spawn(
        process.execPath,
        [PATH_TO_EXAMPLE],
        {
          env: { PORT: port}
        });
      var data = ''
      app.stdout.on('data', function(d) {
        data += d;
        if(data.indexOf('Server running at http://127.0.0.1:') !== -1) {
          testurl('http://127.0.0.1:' + port, function (err, data) {
            if(err) return done(err);
            app.kill();
            done();
          });
        }
      });
      var errstr = '';
      app.stderr.on('data', function(d) {
        done('stderr received data');
      })
    })

  });

  it('is forkable', function(done) {
    var app = child_process.fork(PATH_TO_EXAMPLE);
    app.on('message', function(m) {
       // test that the port is indeed responding
      m['SOCKETSTREAM_PORT'].should.be.a('number');
      testurl('http://127.0.0.1:' + m['SOCKETSTREAM_PORT'], function(err, data) {
        app.kill();
        done();
      })
    })
  });

  it('is callable', function(done) {
    var app = require(PATH_TO_EXAMPLE);
    app.main(function(port) {
      port.should.be.a('number');
      testurl('http://127.0.0.1:' + port, function(err, data) {
        done();
      })
    })
  });
})