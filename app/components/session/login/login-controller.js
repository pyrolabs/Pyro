angular.module('pyroApp.controllers')
.controller('LoginCtrl', function($scope, $state, $rootScope, pyroService) {
  console.log('LoginCtrl')
  // Form data for the login modal
  $scope.loginData = {};
  $scope.login = function() {
    console.log('[LoginCtrl] Login called:');
    pyroService.login($scope.loginData).then(function(userData){
      console.log('login successful:', userData);
      $state.go('home');
    }, function(err){
      $scope.err = err;
      console.error('[LoginCtrl] Error Logging In:');
    });
  };
})