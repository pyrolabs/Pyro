angular.module('pyroApp.controllers')
.controller('LoginCtrl', function($scope, $state, $rootScope, pyroMaster) {
  console.log('LoginCtrl')
  // Form data for the login modal
  $scope.loginData = {};
  if(pyroMaster.getAuth() != null){
    $state.go('home');
  }
  $scope.login = function() {
    console.log('[LoginCtrl] Login called:');
    pyroMaster.$login($scope.loginData).then(function(userData){
      console.log('login successful:', userData);
      pyroMaster.$getFbAccount($scope.loginData, userData).then(function(fbAccount){
        console.log('Fb account returned:', fbAccount);
        $state.go('home');
      }, function(err){
        console.error('error getting fb Account:', err);
        $scope.err = {error:err, message:'No Firebase Account exists for this information'};
      });
    }, function(err){
      $scope.err = err;
      console.error('[LoginCtrl] Error Logging In:', err);
    });
  };
})