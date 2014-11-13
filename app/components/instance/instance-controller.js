angular.module('pyroApp.controllers')

.controller('InstanceListCtrl', function($scope, $state, $rootScope, $ionicLoading) {
  console.log('InstanceListCtrl');
  // Form data for the login modal

  $scope.viewDetail = function(argId) {
    console.log('viewDetail called with: ', argId);
    console.log('loading:', $scope.list.$getRecord(argId));
    $state.go('app-detail', {appId:argId});
  }
})
.controller('InstanceDetailCtrl', function($scope, $state, $rootScope, $stateParams, $ionicLoading) {
  console.log('AppDetailCtrl');
})