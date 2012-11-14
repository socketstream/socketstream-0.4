/*

   Resolve Route
   -------------
   Tries the original route first for speed. If none exists, recursively fall back until we find a route
   This allows us to fully support HTML5 pushState 'mock routing' and multiple single-page clients simultaneously

*/

function ResolveRoute (routes, url){

  // Try to find exact match
  for (var route in routes) {
    if (url.toLowerCase() === route.toLowerCase()) return routes[route]
  }

  // We're at the top of the stack and no route was found
  if (url === '/') return false

  // Else recursively call again
  var sr;
  if (url.indexOf('?') >= 0) {
    sr = url.split('?')
  } else {
    sr = url.split('/')
  }
  sr.pop()

  var newUrl = sr.join('/')
  if (!newUrl.length > 0) newUrl = '/'

  return ResolveRoute(routes, req, res)

}

module.exports = ResolveRoute