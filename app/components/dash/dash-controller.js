angular.module('pyroApp.controllers')

.controller('DashCtrl', function($scope, $state, $rootScope, $stateParams) {
  console.log('DashCtrl');

  $scope.init = function() {
    var instanceInfo = {name:$stateParams.appId};
    $rootScope.pyro.loadInstance(instanceInfo, function(returnedInstance){
      console.log('pyroInstance loaded:', returnedInstance);
      $rootScope.pyroInstance = returnedInstance;
      $rootScope.$apply();
    }, function(err){
      $scope.err = err;
    });
  }
})