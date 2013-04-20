// Message parsing benchmarks
//
// Used to determine the fastest and most flexible way to multiple messages
// for multiple services over the websocket

var passes = 10000000;

var sampleMessages = [
  '~1|12323|{"m": "this.method", "p": [{"name": "Rodger Rabbit", "country": "Eng|and"}, 32]}',
  '~2|546879875|{"m": "this.method", "p": [{"name": "Rodger Rabbit", "country": "Eng|and"}, 32]}',
  '~3|{"e": "eventname", "p": [{"name": "Rodger Rabbit", "country": "Eng|and"}, 32]}',
  '~4|54654545|{"m": "this.method", "p": [{"name": "Rodger Rabbit", "country": "Eng|and"}, {"name": "Rodger Rabbit", "country": "Eng|and"}, {"name": "Rodger Rabbit", "country": "Eng|and"}, {"name": "Rodger Rabbit", "country": "Eng|and"}, 32]}'
];

var methods = {

  // my preffered method for now
  'indexof': function (msg) {
    var i = msg.indexOf('|');
    var id = msg.substr(0, i);
    var content = msg.substr(i+1);
    return [id, content];
  },

  // slower, but could be useful if we stack more attributes into the message (e.g. callbackId)
  'splitjoin': function (msg) {
    var ary = msg.split('|');
    var id = ary.shift();
    return [id, ary.join('|')];
  },

  // padding feels ugly. is there a better way?
  'fixedlength': function (msg) {
    var id = msg.substr(0,2);
    msg = msg.substr(0,2).replace('~','');
    return [id, msg];
  },

  // not really viable as we'd be limited to a very small number of services
  'fixedlength2': function (msg) {
    var id = msg.substr(0,1);
    msg = msg.substr(0,1);
    return [id, msg];
  }

};


function run(name) {
  var start = Date.now();
  var thisPass = passes;
  while (thisPass > 0) {
    var randomMessage = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
    var out = methods[name](randomMessage);
    if (out.length != 2) throw Error('Invalid');
    thisPass--;
  }
  console.log(String(passes) + " passes using " + name + " took " + String(Date.now() - start) + "ms");
}


run('indexof');
run('splitjoin');
run('fixedlength');
run('fixedlength2');
