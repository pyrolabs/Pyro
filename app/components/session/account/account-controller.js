
angular.module('pyroApp.controllers')
.controller('SignupCtrl', function($rootScope, $scope, $state, pyroMaster) {
  console.log('SignupCtrl');
	$scope.signupData = {};
  $scope.createAccount = function() {
  	console.log('[SignupCtrl] createAccount called');
    // [TODO] This should be a service and error checked.
    $scope.loading.signup = true;
    pyroMaster.$pyroSignup($scope.signupData).then(function(newAccount){
      console.log('$lockedSignup successful:', newAccount);
      $scope.loading.signup = false;
      $state.go('home');
    }, function(err){
      console.error('[SignupCtrl] Error running $lockedSignup:', err);
      $scope.loading.signup = false;
      $scope.err = err;
      // if(err.error = "USER_EXISTS") {
      //   //Firebase account already exists with different credentials... prompt to login
      //   $scope.err = {message:'Firebase account already exists. Please login: ', error:'USER_EXISTS'};
      // } else {
      //   $scope.err = err;
      // }
    });
  };
})

.controller('AccountCtrl', function($rootScope, $scope, $state, user) {
  console.log('AccountCtrl');
  $scope.account = user;
  $scope.changePassword = function(pass, confirm, newPass) {
    resetInfo();
    if( !pass || !confirm || !newPass ) {
      $scope.err = 'Please fill in all password fields';
    }
    else if( newPass !== confirm ) {
      $scope.err = 'New pass and confirm do not match';
    }
  };
  $scope.changeEmail = function(pass, newEmail) {

  };
  function resetInfo() {
    $scope.err = null;
    $scope.msg = null;
    $scope.emailerr = null;
    $scope.emailmsg = null;
  }
});
