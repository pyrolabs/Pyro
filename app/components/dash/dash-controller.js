angular.module('pyroApp.controllers')

.controller('DashCtrl', function($scope, $state, $rootScope, $stateParams, instance, pyroMaker) {
  console.log('DashCtrl');
  console.log('Instance loaded:', instance);
  $scope.pyroInstance = pyroMaker(instance.url);
  console.log('scope set:', $scope.pyroInstance);
  $scope.pyroInstance.getObjectCount('users').then(function(count){
  	$scope.userCount = count;
  });
})