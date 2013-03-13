// Fake Tweet Stream
//
// Use this as an example of a Readable stream

var stream = require('stream');

var possibleTweets = [
  {username: 'kris_trujillo', text: "\"Software engineering will be different from other kinds of engineering\" - Glenn Vanderburg on Real Software Engineering #qconsf"},
  {username: 'TechWraith', text: "Heading to #QConSF - I'll be speaking today about integrating MVC apps with realtime technologies. Going over our recent work on Geddy."},
  {username: 'qedtherese', text: "Software engineering is science and art #qconsf"},
  {username: 'mde', text: "Just introduced my Realtime Web speakers for #QConSF. Great crowd this morning."}
];

function getRandomTweet() {
  return possibleTweets[Math.floor(Math.random() * possibleTweets.length)];
}

module.exports = function(seconds) {

  var s = new stream.Readable();

  s._read = function(buf) {
    // resume pushing data
  };

  // keep sending
  setInterval(function(){
    s.push(JSON.stringify(getRandomTweet()));
  }, seconds * 1000);

  return s;

};

