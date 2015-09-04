// Require your routes here for them to be considered 
// by the router
module.exports.load = function(router) {
  return [].concat(
    require('./falcor-route-list-example.js'),
    require('./falcor-route-item-example.js')
  );
};