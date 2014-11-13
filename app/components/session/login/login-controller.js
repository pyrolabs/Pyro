angular.module('pyroApp.controllers')
.controller('LoginCtrl', function($scope, $state, $rootScope) {
  console.log('LoginCtrl')
  // Form data for the login modal
  $scope.loginData = {};
  $scope.err = {};
  $scope.login = function() {
    console.log('emailLogin called:');
    $scope.err = null;
    $rootScope.pyro.login($scope.loginData, function(userData) {
      console.log('login successful:', userData);
      $state.go('home');
    }, function(err) {
      $scope.err.message = err;
    });
  };
})