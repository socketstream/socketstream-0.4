/*

  Raw Stream Service
  ------------------
  Exposes a raw stream.
  WARNING: Just placing the file here for now - it's 100% garunteed to change or be removed

*/


module.exports = function(app) {

  return {
    server: function(server) {

      server.write = function(buf) {
        server.emit('data', buf)
      }

      return server

    },
    client: function(client) {

      client.expose('tweetStream', client)

    }

  }
}