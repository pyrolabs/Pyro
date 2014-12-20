
angular.module('pyroApp.controllers')
.controller('SignupCtrl', function($rootScope, $scope, $state, pyroMaster, $window) {
  console.log('SignupCtrl');
	$scope.signupData = {};
  $scope.err = {};
  $scope.createAccount = function() {
  	console.log('[SignupCtrl] createAccount called');
    // [TODO] This should be a service and error checked.
    $scope.loading.signup = true;
    pyroMaster.$lockedSignup($scope.signupData).then(function(newAccount){
      $window.ga('send','event', 'account-controller', 'CreateAccount', $scope.signupData.email);
      console.log('$lockedSignup successful:', newAccount);
      $scope.loading.signup = false;
      $state.go('home');
    }, function(err){
      console.error('[SignupCtrl] Error running $lockedSignup:', err);
      $scope.loading.signup = false;
      $scope.err = err;
    });
  };
  //---------- Fake Signup Button -----------//
  // $showSignupAttemptedMessage = false;
  // $scope.signupAttempt = function(){
  //   // Record Signup Attempt while signup is closed
  //   $scope.showSignupAttemptedMessage = true;
  //   pyroMaster.$createObject('betaAccountCreateAttempts', $scope.signupData.email).then(function(objectSnap){
  //     console.log('Signup attempted:', objectSnap);
  //   });
  // };
})









.controller('AccountCtrl', function($rootScope, $scope, $state) {
  console.log('AccountCtrl');
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