angular.module('pyroApp.controllers')
.controller('LoginCtrl', function($scope, $state, $rootScope) {
  console.log('LoginCtrl')
  // Form data for the login modal
  $scope.loginData = {};

  $scope.emailLogin = function() {
    console.log('emailLogin called:');
    $scope.err = null;
  };
})