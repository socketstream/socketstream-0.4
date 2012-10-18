/*
   
   HTTP Router
   -----------
   Provides a simple way of matching incoming URLs to Single Page Clients
   TODO: This code is ugly. Needs cleaning up and testing thoroughly!

*/

module.exports = function (app){

  // Try the original route first for speed. If none exists, recursively fall back until we find a route, if possible
  // This allows us to fully support HTML5 pushState 'mock routing' and multiple single-page clients simultaneously
  function resolveRoute(url, req, res){

    // Don't try to route requests for client assets or static files
    if (url.substring(0,5) === '/_ss/' || url.indexOf('.') >= 0) return false;

    for (route in app.routes) {

      if (url.toLowerCase() === route.toLowerCase()) {

        var handler = app.routes[route]
       
        // If routing function
        if (typeof handler === 'function') {
          return handler(req, res)

        // Else, assume Single Page Client
        } else {
          return handler.view(req).pipe(res)
        }
      }
    }

    if (url === '/') {
      return false;
    } else { //recursively call again
      var sr;
      if (url.indexOf('?') >= 0) {
        sr = url.split('?')
      } else {
        sr = url.split('/')
      }
      sr.pop()

      var newUrl = sr.join('/');
      if (!newUrl.length > 0) newUrl = '/';
      return resolveRoute(newUrl, req, res);
    }

  }

  // Route a request
  return function(req, res) {
    resolveRoute(req.url, req, res) || app.serveAssets(req).pipe(res)
  }

}


