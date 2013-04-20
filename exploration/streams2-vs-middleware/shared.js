var sampleMessages = [
  '1|{"m": "squareNumber", "p": [32]}',
  '1|{"m": "toUpperCase", "p": ["this", "is", "a", "string"]}'
];

exports.getRandomMsg = function() {
  return sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
};

exports.rpcMethods = {
  'squareNumber': function(params, cb) { cb(params[0] * params[0]); },
  'toUpperCase': function(params, cb) { cb( params.map(function(word){ return word.toUpperCase(); }) ); },
};

exports.demultiplexMessage = function(msg) {
  var i = msg.indexOf('|'),
    serviceId = msg.substr(0, i),
    content = msg.substr(i + 1);
  return [serviceId, content];
}