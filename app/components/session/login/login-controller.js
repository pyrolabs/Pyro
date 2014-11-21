angular.module('pyroApp.controllers')
.controller('LoginCtrl', function($scope, $state, $rootScope) {
  console.log('LoginCtrl')
  // Form data for the login modal
  $scope.loginData = {};
  $scope.login = function() {
    console.log('emailLogin called:');
    $rootScope.pyro.login($scope.loginData, function(userData) {
      console.log('login successful:', userData);
      $rootScope.account = userData;
      $state.go('home');
    }, function(err) {
      $scope.err = err;
      $scope.$apply();
    });
  };
})