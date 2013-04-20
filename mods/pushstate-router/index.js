/*!
 * PushState Router
 * 
 * Tries the original route first for speed. If none exists, recursively fall back until we find a route
 * This allows us to fully support HTML5 pushState 'mock routing' and multiple single-page clients simultaneously
 */


function Router() {
  this.routes = {};
}


/**
 * Add New Route
 */
Router.prototype.route = function(url, handler){
  if (url[0] != '/') throw new Error('Route URL must begin with /');
  this.routes[url.toLowerCase()] = handler;
};

/**
 * Resolve Route
 */
Router.prototype.resolve = function(url){

  url = url.toLowerCase();

  // First, try to find exact match
  for (var route in this.routes) {
    if (url === route) {
      return this.routes[route];
    }
  }

  // If we're at the top of the stack and no route was found, return false
  if (url === '/') return false;

  // Else recursively call again
  var sr;
  if (url.indexOf('?') >= 0) {
    sr = url.split('?');
  } else {
    sr = url.split('/');
  }
  sr.pop();

  url = sr.join('/');
  if (url.length === 0) url = '/';

  return this.resolve(url);
};


module.exports = Router;