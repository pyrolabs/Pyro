angular.module('pyroApp.controllers')

.controller('DataCtrl', function($scope, $state, $rootScope, $stateParams, PyroArray, $window) {
  console.log('DataCtrl');
  $scope.instanceList = PyroArray('instances');

  $scope.instanceList.$loaded().then(function(pyroList) {
    // [TODO] get pyro object by selecting from exisiting list
    $scope.isLoading = false;
    console.log('scope set:', $scope.instanceList[0]);
    $scope.pyroInstance = _.findWhere(pyroList, {name:$stateParams.appId})
    console.log('mainRef:', $scope.pyroInstance.mainRef.toString());
    $scope.pyroInstance.mainRef.on('value', function(pyroSnap){
      $scope.jsonData = pyroSnap.val();
      console.log('pyro data:', $scope.jsonData);
    });
  });

  

})