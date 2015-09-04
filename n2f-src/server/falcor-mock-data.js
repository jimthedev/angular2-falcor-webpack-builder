var _ = require('lodash');

/**
 * SERVER CALLS
 * REPLACE THESE WITH REAL REST HTTP CALLS
 *
 * serverResponse
 * --------------
 * Anywhere you see a variable called serverResponse
 * assume that it should be replaced with the result
 * of a real REST HTTP call.
 *
 * databaseContents
 * ----------------
 * Anywhere you see a variable called databaseContents,
 * it is safe to assume that we're just showing how an
 * HTTP call could get back different results from
 * the REST server depending on the params are sent
 * over the wire. We're just showing the database table
 * contents for reference.
 */

var configDB = [
  {
    id: 3,
    name: 'Manager Jane',
    myEmployeeLists: [5, 8]
  },
  {
    id: 5,
    name: 'Manager John',
    myEmployeeLists: [8, 13]
  }
];

var employeeListDB = [
  {
    id: 5,
    name: 'Highly performing employees',
    employees: [144, 150, 160]
  },
  {
    id: 8,
    name: 'Satisfactory employees',
    employees: [2, 45]
  },
  {
    id: 13,
    name: 'Under performing employees',
    employees: [90]
  }
];

function getUserConfig(userId) {

  // This is just to show that the backend database
  // will have more than one person in it.

  /** 
   * REPLACE THIS WITH A REAL REST CALL
   * to, for example: /user/:userid/config
   *
   */
   
  var serverResponse = configDB
    .filter(function(value) {
      return value.id===userId;
    });
  return serverResponse[0];
}

function getEmployeeLists(employeeListIdsRequested) {

  // Only return the employeeLists whose IDs were requested
  var serverResponse = [];
  employeeListDB
    .filter(function(employeeList, index) {
      if(_.includes(employeeListIdsRequested, employeeList.id))
      {
        serverResponse[index] = employeeList;
      }
    });
  return serverResponse;
}

module.exports = {
  getUserConfig: getUserConfig,
  getEmployeeLists: getEmployeeLists
};