angular.module('pyroApp.controllers')

.controller('DashCtrl', function($scope, $state, $rootScope, $stateParams) {
  console.log('DashCtrl');
  $scope.instance = $rootScope.instanceList[$stateParams.appId];
})