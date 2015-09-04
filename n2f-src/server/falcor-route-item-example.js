/** 
 * Every route file should export an array of routes
 * this allows like routes to be grouped and sub grouped
 * by just concating.
 **/

module.exports = [
  {
    route: 'employeesById[{integers:employeeIds}][{keys}]',
    get: function(pathSet) {
      if (this.userId == null) {
        throw new Error('not authorized');
      }
      if (typeof pathSet[2]==='undefined') {
        throw new Error('no values were requested');
      }

      var employeeIds = pathSet.employeeIds;
      console.log('employee IDs are',employeeIds);
      // Coerce a single string into an array
      var keys = [].concat(pathSet[2]);

      // TODO: swap this dummy data out for a service call to employeeService.getEmployees()
      var employees = {
        2: {
          doc: {
            favBand: 'Metalica'
          }
        },
        45: {
          doc: {
            favBand: 'Weezer'
          }
        },
        90: {
          doc: {
            favBand: 'Elvis'
          }
        },
        144: {
          doc: {
            favBand: 'Michael Jackson'
          }
        },
        150: {
          doc: {
            favBand: 'Cake'
          }
        },
        155: {
          doc: {
            favBand: 'Jamie xx'
          }
        },
        160: {
          doc: {
            favBand: 'Mason Jennings'
          }
        }
      };

      var results = [];

      employeeIds.forEach(function(employeeId) {
        var employeeRecord = employee[employeeId];
        keys.forEach(function(key) {
          if (employeeRecord.error) {
            results.push({
              path: ['employee', employeeId, key],
              value: $error(employeeRecord.error)
            });
          } else if (employeeRecord.doc) {
            results.push({
              path: ['employee', employeeId, key], 
              value: employeeRecord.doc[key]
            });
          } else {
            results.push({
              path: ['employee', employeeId],
              value: undefined
            });
          }
        });
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
  }
];
