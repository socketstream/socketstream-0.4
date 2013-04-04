// Code for client

module.exports = function(client) {

  // Store all initialized modules so instances can be reused
  var models = {};

  // Listen for model updates
  client.onmessage = function(obj) {

    var model = models[obj.m];
    model.cache.removeAll();
    
    model.bindings.forEach(function(binding){
      console.log('applying', obj, typeof(obj), binding.name, binding.scope[binding.name]);

      binding.scope.$apply(function(){
        var data = binding.scope[binding.name].$$v;
        if (data.length) {
          angular.forEach(data, function(value, key){
            if (String(value.id) === String(obj.id)) data[key] = obj.d;  
          });
        } else {
          if (String(data.id) === String(obj.id)) {
            binding.scope[binding.name].$$v = obj.d;  
          }
        }
        
      });

    });

  };


  var module = window.angular.module('rtsAngular', []);

  module.factory('model', ['$q', '$rootScope', '$cacheFactory', function($q, $rootScope, $cacheFactory) {

    function Model (name) {
      this.name = name;
      this.bindings = [];
      this.rootScope = $rootScope;
      this.cache = $cacheFactory('rtm:' + name);
    }

    Model.prototype.get = function(params, options) {
      return this.action('get', params, options);
    };

    Model.prototype.andBind = function(scope, name) {
      this.bindings.push({scope: scope, name: name});
      return this;
    };

    Model.prototype.action = function(action, params, options) {
      var self = this;
      var deferred = $q.defer();
      options = options || {};

      var command = {m: this.name, a: action, p: params};
      var commandHash = JSON.stringify(command);

      // Try Query Cache
      var cachedResponse = this.cache.get(commandHash);
      if (cachedResponse) {
        
        client.debug('found cached response', cachedResponse);
        deferred.resolve(cachedResponse);

      } else {

        // Fetch data from server
        client.send(command, function(data){

          if (data.e) {
            var errorMessage = data.e + (data.p ? ': ' + data.p : '');
            throw(errorMessage);
          } else {
            $rootScope.$apply(function(scope) {
              self.cache.put(commandHash, data.r);
              deferred.resolve(data.r);
            });
          }

        });

      }

      return deferred.promise;
    };


    // Return existing model object or initialize a new one
    return function(modelName, scope) {
      if (!models[modelName]) {
        client.debug('Initializing new model for', modelName);
        models[modelName] = new Model(modelName, scope);
      }
      return models[modelName];
    };

  }]);

};