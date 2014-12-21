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
    $scope.loading.login = true;
    pyroMaster.$pyroLogin($scope.loginData).then(function(userData){
      console.log('login successful:', userData);
      $scope.loading.login = false;
      $state.go('home');
    }, function(err){
      $scope.loading.login = false;
      if(err.error = "USER_EXISTS") {
        //Firebase login info is not the same as given password (maybe it changed?)
        $scope.err = {message:'Info does not match Firebase account.'};
        // $state.go('fbLogin');
      } else {
        $scope.err = err;
        console.error('[LoginCtrl] Error Logging In:', err);
      }
     
    });
  };
  $scope.fbLogin = function() {
    console.log('[LoginCtrl] fbLogin called:');
    $scope.loading.login = true;
    pyroMaster.$fbLogin($scope.loginData).then(function(userData){
      console.log('fbLogin successful:', userData);
      $scope.loading.login = false;
      $state.go('signup');
    }, function(err){
      $scope.loading.login = false;
      $scope.err = err;
      console.error('[LoginCtrl] Error Logging In to fbAccount:', err);
    });
  };
})