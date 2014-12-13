angular.module('pyroApp.controllers')

.controller('InstanceListCtrl', function($scope, $state, $rootScope, pyroMaster, PyroArray, user, auth) {
  console.log('InstanceListCtrl');
  // Form data for the login modal
  $rootScope.auth = auth;
  $rootScope.account = user;
  $scope.viewingInstance = true;
  $scope.newAppData = {};
  $scope.err = {};
  $scope.cardClasses = ['bg-primary lt', 'bg-info lt', 'bg-success lter', 'bg-warning lter', 'bg-light dk'];
  // $rootScope.instanceList = instanceList;
  // Update instance list with any updates that happen after page load
  // pyroMaster.library.getListByAuthor('instances', function(returnedList){
  //   console.log('[InstanceListCtrl]instance list loaded:', returnedList);
  //   $rootScope.instanceList = returnedList;
  // });
  $scope.instancesArray = PyroArray('instances');
  $scope.instancesArray.$loaded().then(function(loadedList){
    $rootScope.instanceList = loadedList;
    console.log('$rootScope.instanceList set:', $scope.instanceList);

    angular.forEach($scope.instancesArray, function(value, key) {
      populateInstanceUserCounts(value, key);
    });
  });
 
  $scope.instancesArray.$watch(function(event){

  });

  function populateInstanceUserCounts(argValue, argKey) {
    var ref = new Firebase(argValue.dbUrl);
    // Attach an asynchronous callback to read the data at our posts reference
    ref.once("value", function(snapshot) {
      var db = snapshot.val();
      if(db.users) {
        var count = countThis(db.users);
        console.log("length of users ",count);
        $scope.instancesArray[argKey].userCount = count;
      } else {
        console.log("No users found.");
        $scope.instancesArray[argKey].userCount = 0;
      }
      if(db.sessions){
        var count2 = countThis(db.sessions);
        console.log("Total Sessions: ",count2);
        $scope.instancesArray[argKey].sessionCount = count2;

      } else {
        console.log("No sessions found.");
        $scope.instancesArray[argKey].sessionCount = 0;
      }
       if(!$scope.$$phase) {
          $scope.$apply();
        }
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
        return null
    });
  }

  function countThis(obj) {
    return _.countBy(obj, function() {
      return 'count';
    }).count;
  }
  $scope.viewDetail = function(argName) {
    console.log('viewDetail called with: ', argName);
    console.log('loading:', $rootScope.instanceList.$getRecord(argName));
    $state.go('dash', {
      appId: argName
    });
  }
  $scope.manageInstance = function() {
    console.log('manageInstance called', $scope.newAppData);
    if ($scope.newAppData.hasOwnProperty('name')) {
      pyroMaster.$manageInstance($scope.newAppData).then(function(returnedInstance) {
        console.log('[InstanceListCtrl]instance created successfully:', returnedInstance);
        $state.go('data', {
          appId: returnedInstance.name
        });
      }, function(err) {
        console.error('error creating instance:', err);
        $scope.err = err;
      });
    } else {
      $scope.newAppData = {};
      $scope.err = {
        message: 'Please enter a url for your new instance'
      };
    }
  }
  $scope.simpleSetup = function() {
    console.log('[InstanceListCtrl] simpleSetup called:');
    $scope.loading.simpleSetup = true;
    if ($scope.newAppData && $scope.newAppData.hasOwnProperty('name')) {
      pyroMaster.$generatePyro($scope.newAppData.name).then(function(returnedInfo) {
        console.log('[InstanceListCtrl] newPyroInstance successful with:', returnedInfo);
        $scope.loading.simpleSetup = false;
        $state.go('data', {
          appId: $scope.newAppData.name
        });
      }, function(err) {
        console.error('[InstanceListCtrl] error creating new instance:', err);
        $scope.loading.simpleSetup = false;
        $scope.err = err;
      });
    }

  }
  $scope.startDelete = function(argName) {
    console.log('[InstanceListCtrl] startDelete called');
    var r = confirm("Are you sure you want to delete this app?");
    if (r == true) {
      console.log('confirm was true, deleteing:', argName);
      pyroMaster.$deleteObject('instances', argName);
    }
  }
})