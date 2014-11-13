angular.module('pyroApp.controllers')

.controller('InstanceListCtrl', function($scope, $state, $rootScope) {
  console.log('InstanceListCtrl');
  // Form data for the login modal

  $scope.viewDetail = function(argId) {
    console.log('viewDetail called with: ', argId);
    console.log('loading:', $scope.list.$getRecord(argId));
    $state.go('dash', {appId:argId});
  }
})
.controller('InstanceDetailCtrl', function($scope, $state, $rootScope, $stateParams) {
  console.log('AppDetailCtrl');
})