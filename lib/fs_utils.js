/*
   
   File Utils
   ----------

*/


var fs = require('fs'),
    path = require('path');

// Read the contents of a dir. Adapted from https://gist.github.com/825583
exports.readDirSync = function(start) { 
  try {
    // Use lstat to resolve symlink if we are passed a symlink
    var stat = fs.lstatSync(start);
    var found = {dirs: [], files: []}, total = 0, processed = 0;
    function isHidden(path){ return path.match(/(^_|^\.|~$)/); }
    function isDir(abspath) {
      var stat = fs.statSync(abspath);
      var abspathAry = abspath.split('/')
      if(stat.isDirectory() && !isHidden(abspathAry[abspathAry.length -1])) {
        found.dirs.push(abspath);
        // If we found a directory, recurse!
        var data = exports.readDirSync(abspath);
        found.dirs = found.dirs.concat(data.dirs);
        found.files = found.files.concat(data.files);
        if(++processed == total) return found;
      } else {
        var abspathAry = abspath.split('/')
        var file_name = abspathAry[abspathAry.length-1];
        if (!isHidden(file_name)) found.files.push(abspath);
        if(++processed == total) return found;
      }
    }
    // Read through all the files in this directory
    if(stat.isDirectory()) {
      var files = fs.readdirSync(start).sort();
      total = files.length;
      for(var x=0, l=files.length; x<l; x++) {
        isDir(path.join(start, files[x]).replace(/\\/g, '/')); // replace '\' with '/' to support Windows
      }
    } else {
      throw (new Error("path: " + start + " is not a directory"));
    }
    return found;
  
  } catch(e) {
    if(e.code != 'ENOENT') throw(e); // Ignore if optional dirs are missing
    return false;
  };
};

// Recursively get a list of all files within a bunch of directories
exports.getFileNamesSync = function(root, paths) {
  if (paths == null) paths = ['*']

  var files = [];

  // For Windows
  root = root.replace(/\\/g, '/');
  
  var numRootFolders = root.split('/').length;

  // Force paths into an array
  if (!(paths instanceof Array)) paths = [paths];

  paths.forEach(function(path) {
    var sp = path.split('/');

    // If this contains a period (.) assume it's a filename
    if (sp[sp.length - 1].indexOf('.') > 0) {
      
      files.push(path);

    // Else, assume it's a directory and list contents alphabetically
    } else {
      var directoryName = root, tree;
      if (path !== '*') directoryName += '/' + path;

      if (tree = exports.readDirSync(directoryName)) {
        tree.files.sort().forEach(function(file) {
          files.push(file.split('/').slice(numRootFolders).join('/'));
        });
      } else {
        throw new Error(directoryName + " directory not found");
      }
    }

  });
  return files;
};


// Create a directory
exports.mkdir = function (dir) {
  if (!fs.existsSync(dir)) return fs.mkdirSync(dir);
};