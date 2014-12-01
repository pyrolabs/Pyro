angular.module('pyroApp.controllers')

.controller('DashCtrl', function($scope, $state, $rootScope, $stateParams, instance, user, pyroMaster) {
  console.log('DashCtrl');
  console.log('Instance loaded:', instance);
  $rootScope.account = user;
  $scope.pyroInstance = instance;
  // [TODO] get pyro object by selecting from exisiting list
  console.log('scope set:', $scope.pyroInstance);
  $scope.pyroInstance.getUserCount(function(userCount){
    $scope.userCount = userCount;
    $scope.$apply();
  });
  $scope.pyroInstance.getObjectCount('sessions',function(sessionCount){
  	console.log('sessionCount updated:', sessionCount);
    $scope.sessionCount = sessionCount;
    $scope.$apply();
  });
})