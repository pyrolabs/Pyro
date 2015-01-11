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
      console.log('[LoginCtrl] Login successful:', userData);
      $scope.loading.login = false;
      $state.go('home');
    }, function(err){
      $scope.loading.login = false;
      console.log('[LoginCtrl] Error logging in: ', err);
      if(err){
        $scope.err = err;

        if(err.hasOwnProperty('error') && err.error == 'USER_EXISTS'){
          $scope.err.message = "Invalid Login Information"; 
        }
      } else {
        $scope.err = {message:'Server Error'};
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
