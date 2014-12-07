angular.module('pyroApp.controllers')

.controller('DataCtrl', function($scope, $state, $rootScope, $window, instance, pyro) {
  console.log('DataCtrl');
  $scope.pyroInstance = pyro(instance);

  // $scope.instanceList = PyroArray('instances');
  // $scope.instanceList.$loaded().then(function(pyroList) {
  //   // [TODO] get pyro object by selecting from exisiting list
  //   $scope.isLoading = false;
  //   console.log('scope set:', $scope.instanceList.$getRecord($stateParams.appId));
  //   $scope.pyroInstance = $scope.instanceList.$getRecord($stateParams.appId);
  //   var appFb = new Firebase($scope.pyroInstance.dbUrl);
  //   appFb.on('value', function(pyroSnap){
  //     $scope.jsonData = pyroSnap.val();
  //     console.log('pyro data:', $scope.jsonData);
  //   });
  // });
})