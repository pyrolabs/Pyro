angular.module('pyroApp.controllers')
.controller('LoginCtrl', function($scope, $state, $rootScope, pyroMaster) {
  console.log('LoginCtrl')
  // Form data for the login modal
  $scope.loginData = {};
  $scope.login = function() {
    console.log('[LoginCtrl] Login called:');
    pyroMaster.login($scope.loginData).then(function(userData){
      console.log('login successful:', userData);
      $state.go('home');
    }, function(err){
      $scope.err = err;
      console.error('[LoginCtrl] Error Logging In:');
    });
  };
})