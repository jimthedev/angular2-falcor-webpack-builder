var Router = require('falcor-router');

// Load our routes
var routes = require('./falcor-routes-example');
  
// Create a Router base class and load up our routes
var MyFalcorAppRouterBase = Router.createClass(routes.load(this));

// Creating a constructor for a class that derives from BaseRouter
// We pass in the user id (or any other data) that needs to be used
// by the routes when making requests and responding with data
var MyFalcorAppRouter = function(userId){
    
    // Invoking the base class constructor
    MyFalcorAppRouterBase.call(this)

    // Make our auth data available in every router instance
    this.userId = userId;
    
  };

// Creating a derived class using JavaScript's classical inheritance pattern
MyFalcorAppRouter.prototype = Object.create(MyFalcorAppRouterBase.prototype);

// Use the factory pattern
module.exports = function(userId) {
	return new MyFalcorAppRouter(userId);
}