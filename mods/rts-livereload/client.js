module.exports = function(client) {

  client.onmessage = function(msg) {

    // Reload browser if reload system event received
    switch (msg) {
      case 'reload':
        window.location.reload();
        break;
      case 'updateCSS':
        var tags = document.getElementsByTagName("link");
        for (var i = 0; i < tags.length; i++) {
          var tag = tags[i];
          if (tag.rel.toLowerCase().indexOf("stylesheet") >= 0 && tag.href) {
            var h = tag.href.replace(/(&|%5C?)\d+/, "");
            tag.href = h + (h.indexOf("?") >= 0 ? "&" : "?") + (new Date().valueOf());
          }
        }
        break;
    }
  };

};