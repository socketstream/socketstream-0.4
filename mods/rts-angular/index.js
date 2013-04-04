"use strict";

/*

  AngluarJS Service
  -----------------
  Enable Angular modules to load data from the server and keep in sync

*/

require('colors');

var RTM = require('realtime-model')();
var apiTree = require('apitree');

module.exports = function(options) {

  return {

    use: {json: true, callbacks: true, sessions: true},

    client: require('./client'),

    server: function(server) {

      // Convert action files to models
      var api = apiTree.createApiTree(server.service.assigned.root);
      var models = {};
      for (var name in api) {
        models[name] = RTM.create(name, api[name]); 
      }

      server.log('i'.yellow, 'Looking for models in', server.service.relativeRoot());

      // When clients disconnect, tell the RTM to unwatch records
      server.events.on('client:disconnect', function(clientId){
        RTM.unwatch(clientId);
      });

      // Listen for model updates
      RTM.events.on('event', function(socketIds, msg){
        server.log('Update received! for', socketIds, msg);
        server.sendToSocketIds(socketIds, msg);
      });

      // To be implemented somehow in RTS
      //service.sendClientLibrary(__dirname + '/angular.js');

      // Listen to incoming requests
      server.onmessage = function(msg, meta, reply) {

        server.debug('incoming msg', msg);

        msg.p = msg.p || {};

        server.log('➙'.cyan, msg.m, msg.a.green, JSON.stringify(msg.p).grey);

        //var modelNameAry = msg.m.split('.');
        //var actions = getBranchFromTree(api, modelNameAry);
        var rtm = models[msg.m];

        if (!rtm) return reply({e: 'No model file found'});

        rtm.execute(msg.a, msg.p, meta, server.service.assigned.api, meta.socketId, function(err, response){
          if (err) {
            reply({e: 'Application Error', p: err});
          } else {
            reply({r: response});
          }
        });

      };

    }

  };

};



function getBranchFromTree (tree, ary, index, i) {
  if (!i)  i = 0;
  index = index || ary.length;
  if (i === index) return tree;
  return getBranchFromTree(tree[ary[i]], ary, index, ++i);
}