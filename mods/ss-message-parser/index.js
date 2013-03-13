/*

  SocketStream Message Parser
  ---------------------------
  Designed to multiplex messages for different services running over one websocket connection.

  Design goals:

    - Allow an unlimited number of services to be multiplexed over a websocket
    - Maximum performance (this approach parses ~ 6m/sec messages my 2009 iMac)

  Note a number of other methods were tried and benchmarked (splitting the string,
  fixed bytes + padding) but this was deemed to be the fastest and most flexible approach

*/

function messageParser(services, options) {

  options = options || {};
  options.separator = options.separator || '|';

  return {

    serialize: function(attrs) {
      return attrs.join(options.separator);
    },

    parse: function(msg) {
      var i = msg.indexOf(options.separator),
          serviceId = msg.substr(0, i),
          content = msg.substr(i+1);
      return [serviceId, content];
    }
  };
}

module.exports = messageParser;