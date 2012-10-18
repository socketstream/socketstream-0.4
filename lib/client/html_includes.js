/*
   
   HTML Includes
   -------------
   Generates two sets of HTML tags (for the top and bottom of the main HTML) for all
   the JS and CSS your HTML view requires. Adds a timestamp to prevent caching
   The output depends upon whether or not we're serving cached assets in production

*/

var path = require('path'),
    fsUtils = require('../fs_utils.js');

module.exports = function(root, paths, isCached) {

  // Includes are the JS tags, CSS tags and raw JS code which are concatinated 
  // and used to replace the <SocketStream> tag (or !SocketStream in Jade)
  var topIncludes = [],
      bottomIncludes = [];

  // HEADERS

  // In production mode return from in-memory cache if possible
  if (isCached) {

    // TODO: Implement this!
    // var cssLink = self.resolveAssetLink('css');
    // var jsLink = self.resolveAssetLink('js');
    // topIncludes.push(tag.css(cssLink));
    // topIncludes.push(tag.js(jsLink));

  } else {

    var id = Number(Date.now());

    // Send all CSS
    paths.css.forEach(function(thisPath) {
      var rootPath = path.join(root, paths.css);
      var fileNames = fsUtils.getFileNamesSync(rootPath, thisPath)
      fileNames.forEach(function(fileName){
        topIncludes.push(tag.css("/_ss/css/" + path.basename(fileName) + "?path=" + fileName + "&ts=" + id));
      });
    });

    // Send SocketStream System Libs and Modules
    bottomIncludes.push(tag.js("/_ss/js/_system/?ts=" + id));

    // Send Application Libraries
    (paths.libs || []).forEach(function(thisPath) {
      var rootPath = path.join(root, paths.libs);
      var fileNames = fsUtils.getFileNamesSync(rootPath, thisPath)
      fileNames.forEach(function(fileName){
        bottomIncludes.push(tag.js("/_ss/js/libs/" + fileName + "/?ts=" + id));
      });
    });

    // Send Application Modules
    (paths.mods || []).forEach(function(thisPath) {
      var rootPath = path.join(root, paths.mods);
      var fileNames = fsUtils.getFileNamesSync(rootPath, thisPath)
      fileNames.forEach(function(fileName){
        bottomIncludes.push(tag.js("/_ss/js/mods/" + fileName + "&pathPrefix=" + thisPath));
      });
    });

    // Finally, now all the assets have been sent, run code to initialize the modules
    // and establish the websocket connection
    bottomIncludes.push(tag.js("/_ss/js/_start/?ts=" + id));

  }

  return {top: topIncludes, bottom: bottomIncludes};

}


var tag = {

  css: function(path) {
    return '<link href="' + path + '" media="screen" rel="stylesheet" type="text/css">';
  },

  js: function(path) {
    return '<script src="' + path + '" type="text/javascript"></script>';
  }
};