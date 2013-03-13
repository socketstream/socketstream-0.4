"use strict";

// Used to maintain lists of userIds to socketIds and channelIds to socketIds
// TODO: Replace with ES6 Sets when fully supported in Node/V8

exports.UniqueSet = function() {

  var self = this;

  self.data = [];

  self.add = function(key, value) {
    var set;
    if (!((key != null) && (value != null))) {
      return false;
    }
    if (set = self.data[key]) {
      if (!(set.indexOf(value) >= 0)) {
        return set.push(value);
      }
    } else {
      return self.data[key] = [value];
    }
  };

  self.remove = function(key, value) {
    var i;
    if ((i = self.data[key].indexOf(value)) >= 0) {
      self.data[key].splice(i, 1);
      if (self.data[key].length === 0) {
        return delete self.data[key];
      }
    }
  };

  self.removeFromAll = function(value) {
    return self.keys().forEach(function(key) {
      return self.remove(key, value);
    });
  };

  self.keys = function() {
    return Object.keys(self.data);
  };

  self.members = function(key) {
    return self.data[key] || [];
  };

};
