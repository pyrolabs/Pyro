angular.module('pyroApp.controllers')

.controller('DashCtrl', function($scope, $state, $rootScope, $stateParams, instance, pyroMaker, user) {
  console.log('DashCtrl');
  console.log('Instance loaded:', instance);
  $rootScope.account = user;
  $scope.pyroInstance = pyroMaker(instance.url);
  $scope.pyroInstance.name = instance.name;
  console.log('scope set:', $scope.pyroInstance);
  $scope.userCount = $scope.pyroInstance.getObjectCount('users').then(function(count){
  	$scope.userCount = count;
  });
  $scope.pyroInstance.getObjectCount('sessions').then(function(sessionCount){
  	$scope.sessionCount = sessionCount;
  });

  
})