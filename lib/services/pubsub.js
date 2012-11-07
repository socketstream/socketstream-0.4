/*

  Pub Sub Service
  ---------------
  Publishes events to all connected clients

*/

require('colors')

module.exports = function(app) {

  return {
    server: function(server) {

      var serverAPI = {}

      // Broadcast event to everyone
      serverAPI.all = function(){
        var eventName = arguments[0],
            params = 2 <= arguments.length ? Array.prototype.slice.call(arguments, 1) : [],
            msg = {e: eventName, p: params}
        app.log.debug('➙'.cyan, 'event:all'.grey, eventName)
        server.emit('data', JSON.stringify(msg))
      }

      server.expose('publish', serverAPI)

      return serverAPI

    },
    client: function(client) {

      var EventEmitter = require('events').EventEmitter,
          ee = new EventEmitter

      client.write = function(msg) {
        var event = JSON.parse(msg)
        ee.emit(event.e, event.p)
      }

      client.expose('events', ee)

    }

  }
}