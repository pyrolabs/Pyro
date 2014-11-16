angular.module('pyroApp.controllers')

.controller('AdminCtrl', function($scope, $state, $rootScope, $stateParams) {
  console.log('AdminCtrl');
  var instanceInfo = {name:$stateParams.appId};
  $rootScope.pyro.loadInstance(instanceInfo, function(returnedInstance){
    console.log('pyroInstance loaded:', returnedInstance);
    $scope.pyroInstance = returnedInstance;
    $scope.$apply();
  }, function(err){
    $scope.err = err;
    $scope.$apply();
  })
})