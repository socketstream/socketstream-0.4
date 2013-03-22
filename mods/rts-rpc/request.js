// Process requests from the RPC responder

var apiTree = require('apitree');

// Handle incoming requests from any source
module.exports = function (server, options) {

  var api = apiTree.createApiTree(server.service.assigned.root);

  return function(req, res) {

    var stack = [];

    // Allow the request to pass through middleware before processing the final action
    req.use = function(nameOrModule) {
      var middlewareAry;
      try {
        var args = Array.prototype.slice.call(arguments);
        var mw = (typeof nameOrModule === 'function') ? nameOrModule : function(){}; // app.middleware.get(nameOrModule)
        if (mw) {
          var fn = mw.apply(mw, args.splice(1));
          return stack.push(fn);
        } else {
          throw new Error("Middleware function '" + nameOrModule + "' not found. Please reference internal or custom middleware as a string (e.g. 'session' or 'user.checkAuthenticated') or pass a function/module");
        }
      } catch (e) {
        return res(e, null);
      }
    };
    
    var methodAry = req.method.split('.');
    var methodName = methodAry.pop();

    // RPC actions are stored in namespaced files
    var file = getBranchFromTree(api, methodAry);

    // Check for Errors
    if (!file)                              throw new Error("Unable to find '" + req.method + "' file");
    if (!file.actions)                      throw new Error("Unable to find an 'exports.actions' function for '" + req.method + "'");
    if (typeof file.actions !== 'function') throw new Error("'exports.actions' function for '" + req.method + "' must be a function");

    function cb () {
      var args = Array.prototype.slice.call(arguments);
      return res(null, args);
    }

    var actions = file.actions(req, cb, server.service.assigned.api);

    function main (request, response, next) {
      var method = actions[methodName];
      if (method === null)                  throw new Error("Unable to find '" + req.method + "' method in exports.actions");
      if (typeof method !== 'function')     throw new Error("The '" + req.method + "' method in exports.actions must be a function");
      return method.apply(method, request.params);
    }

    // Make sure the function you want executes after any middleware
    stack.push(main);

    function exec (request, res, i) {
      return stack[i].call(stack, req, res, function() {
        return exec(req, res, i + 1);
      });
    }

    return exec(req, cb, 0);

  };
};


function getBranchFromTree (tree, ary, index, i) {
  if (index == null)  index = null; // ? 
  if (i == null)      i = 0;
  if (index == null)  index = ary.length;
  if (i === index)    return tree;
  return arguments.callee(tree[ary[i]], ary, index, ++i);
}