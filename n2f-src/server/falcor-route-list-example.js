var falcor = require('falcor');
var mockData = require('./falcor-mock-data');
var _ = require('lodash');

var $ref = falcor.Model.ref;

// First we get my personalized config, using REST
// Logged in as Jane, normally we'd figure this out 
// using some auth strategy.
var myConfig = mockData.getUserConfig(3);
var myEmployeeListIds = myConfig.myEmployeeLists;

/*
 * Every route file should export an array of routes
 * this allows like routes to be grouped and sub grouped
 * by just concating.
 */
module.exports = [
  { // WORKING
    route: 'myEmployeeLists.length',
    get: function(pathSet) {
      return {
        path: ['myEmployeeLists','length'],
        value: myEmployeeListIds.length
      }
    }
  },
  { // WORKING
    route : "myEmployeeLists[{integers:requestedIndexes}]",
    get   : function(pathSet) {
      // Use my config to get only my employee lists
      var myEmployeeLists = mockData.getEmployeeLists(myEmployeeListIds);
      var requestedIndexes = pathSet.requestedIndexes;
      console.log(requestedIndexes);
      var requestedMyEmployeeLists = _.map(requestedIndexes, function(ridx) {
        return myEmployeeLists[ridx];
      });
      console.log('requestedMyEmployeeListsRequested:', requestedMyEmployeeLists);

      console.log('myEmployeeLists', myEmployeeLists);
      return requestedMyEmployeeLists
        // TODO: remove this if needed
        // TODO: allow routes to return observables
        .sort(function(a, b) {
          return a.id - b.id;
        })
        .map(function(employeeList, idx) {
          console.log(requestedIndexes[idx] + ' being added is', employeeList);
            return {
                path  : [ "myEmployeeLists", requestedIndexes[idx] ],
                value : {
                    $type : "ref",
                    value : [ "employeeListById", employeeList.id ]
                }
            };
        });
    }
  },
  {
    route: 'employeeListById[{integers:requestedEmployeeListIds}]["name"]',
    get: function(pathSet) {
      if (this.userId == null) {
        throw new Error('not authorized');
      }
      if (typeof pathSet[2]==='undefined') {
        throw new Error('no values were requested');
      }

      var requestedEmployeeListIds = pathSet.requestedEmployeeListIds;

      // Coerce a single string into an array
      var keys = [].concat(pathSet[2]);

      var results = [];

      // Get the ids and the items so that we don't have an o(n) problem
      var employeeLists = mockData.getEmployeeLists(requestedEmployeeListIds);
      var employeeListIds = _.pluck(employeeLists, 'id');

      requestedEmployeeListIds.forEach(function(requestedEmployeeListId) {
        var locatedEmployeeListIndex = employeeListIds.indexOf(requestedEmployeeListId);
        keys.forEach(function(key) {
          results.push({
            path: ["employeeListById", requestedEmployeeListId, key],
            value: employeeLists[locatedEmployeeListIndex][key]
          });
        });
        //   console.log('employeeList[' + key + ']', employeeList[key]);
        //   if (employeeList.error) {
        //     results.push({
        //       path: ['employeeListById', employeeList.id, key],
        //       value: $error('error getting employeeListId', employeeListId, ' key: ', key)
        //     });
        //   } else if (employeeList) {
        //     results.push({
        //       path: ['employeeListById', employeeList.id, key], 
        //       value: employeeList[key]
        //     });
        //   } else {
        //     results.push({
        //       path: ['employeeListById', employeeListId],
        //       value: undefined
        //     });
        //   }
        // });
      });
      return results;
    },
    set: function(jsonGraph) {
      console.log('ROUTER SET REQ: ', jsonGraph);
      if (this.userId == null) {
        throw new Error('not authorized');
      }  
      // Route implementation snipped
    }        
  },
  {
    route: 'employeeList[{integers:employeeListIds}].employees[{integers:employeeIds}]',
    get: function(pathSet) {
      if (this.userId == null) {
        throw new Error('not authorized');
      }
      if (typeof pathSet[2]==='undefined') {
        throw new Error('no values were requested');
      }
      var employeeListIds = pathSet.employeeListIds;
      var employeeIds = pathSet.employeeIds;

      throw new Error(employeeIds);

      var results = [];

      // Loop throw the employeelistids
      employeeListIds.forEach(function (index) {

        // Get the employeelist associated with that id
        var employeeList = employeeList[index];
          
        // Handle the case where the employee list was not found
        if (employeeList == null) {
          results.push({
              path: ['employeeList', index],
              value: employeeList
          });
        } else {
          employeeIds.forEach(function(employeeIndex) {
                  var employeeID = employeeList[index].employees[employeeIndex];

                  if (employeeID == null) {
                      results.push({ path: ["employeeList", index, "employees", employeeIndex], value: employeeID });
                  }
                  else {
                      pathValues.push({
                          path: ['employeeList', index, 'employees', employeeIndex],
                          value: $ref(['employeesById', employeeID])
                      });
                  }
              });
          }
      });

      return results;

    }
  }
];