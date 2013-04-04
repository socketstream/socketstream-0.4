var EventEmitter = require('events').EventEmitter;
var EE = new EventEmitter();

var redis = require('redis');

var pub = redis.createClient();
var sub = redis.createClient();

sub.on('message', function(channel, msg){
  EE.emit('event', JSON.parse(msg));
});

sub.subscribe('rtm');

module.exports = function() {

  return {
    publish: function(name, data) {
      pub.publish('rtm', JSON.stringify(data));
    },

    subscribe: EE
  };

};