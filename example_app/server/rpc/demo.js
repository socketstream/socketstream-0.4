module.exports = function(){


  return {

    sendMessage: function(message) {
      if (message && message.length > 0) {         // Check for blank messages
        ss.publish.all('newMessage', message);     // Broadcast the message to everyone
        return res(true);                          // Confirm it was sent to the originating client
      } else {
        return res(false);
      }
    }

  }

}