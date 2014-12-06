angular.module('pyroApp.controllers')

.controller('DashCtrl', function($scope, $state, $rootScope, $stateParams, user, pyroMaster, PyroArray) {
  console.log('DashCtrl');
  // $rootScope.account = user;
  $scope.instanceList = PyroArray('instances');
  console.log('params:', $stateParams);
});