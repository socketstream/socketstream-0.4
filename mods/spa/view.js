var tagInjector = require('html-tag-injector');
var pathsToTags = require('./paths_to_tags');

module.exports = function(html, paths) {
  
  var tags = pathsToTags(paths);
  view = tagInjector(html, tags);

  return view;
};