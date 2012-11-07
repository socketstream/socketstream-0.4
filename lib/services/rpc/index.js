/*

  RPC Responder
  -------------
  Respond to RPC requests

*/

require('colors')

module.exports = function(app, options) {

  options = options || {}
  options.name = options.name || 'rpc'
  options.root = options.root || '/server/rpc'

  return {
    server: function(stream) {
      
      var Request = require('./request')(app, options)
      
      // Process requests via the websocket
      stream.write = function(data) {

        // Data comes in as an array so we can tell which client sent it
        var msg = JSON.parse(data[0]),
            meta = data[1],
            returnStream = data[2]

        var request = {
          id:           msg.id,
          method:       msg.m,
          params:       msg.p,
          socketId:     meta.socketId,
          clientIp:     '127.0.0.1',//meta.clientIp,
          //sessionId:  meta.sessionId,
          //transport:  meta.transport,
          receivedAt:   Date.now()
        };

        var response = function(err, response) {
          var obj = { id: msg.id, p: response }
          if (request.error) obj.e = request.error
          var timeTaken = Date.now() - request.receivedAt
          app.log.debug('↩'.green, msgLogName, request.method, ("(" + timeTaken + "ms)").grey)
          returnStream.write(JSON.stringify(obj))
        }
      
        // Name for logger
        var msgLogName = (options.name + ':' + request.id).grey

        // Output request
        app.log.debug('↪'.cyan, msgLogName, request.method)

        // Process Request
        try {
          return new Request(request, response)
        } catch (e) {
          var message = (request.clientIp === '127.0.0.1') && e.stack || 'See server-side logs'
          var obj = { e: { message: message } }
          app.log.debug('↩'.red, msgLogName, request.method, e.message.red)
          if (e.stack) app.log.error(e.stack.split("\n").splice(1).join("\n"))
          returnStream.write(JSON.stringify(obj))
        }

      }


    },

    client: function(stream) {

      var cbStack = {},
          cbCount = 0

      // If you don't pass a callback, we show it on the console
      var defaultCallback = function(x) { return console.log(x) }

      // Allow calling 'ss.rpc()' from the client
      var rpcCall = function(args) {

        var id = ++cbCount
        var args = Array.prototype.slice.call(arguments)

        var msg = { m: args[0], id: id }
        var lastArg = args[args.length - 1]

        if (typeof lastArg === 'function') {
          msg.p = args.slice(1, args.length - 1)
          var cb = lastArg
        } else {
          msg.p = args.slice(1)
          var cb = defaultCallback
        }

        cbStack[id] = cb

        stream.emit('data', JSON.stringify(msg))

        // Always return 'undefined'      
        return void 0

      }

      // Handle incoming responses
      stream.write = function(msg) {
        var obj = JSON.parse(msg)
        if (obj.id && (cb = cbStack[obj.id])) {
          if (obj.e) {
            console.error('SocketStream RPC server error:', obj.e.message)
          } else {
            cb.apply(cb, obj.p)
          }
          return delete cbStack[obj.id]
        }
      }

      stream.expose('rpc', rpcCall)

    }

  }
}