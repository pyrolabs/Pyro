
angular.module('pyroApp.controllers')
.controller('SignupCtrl', function($rootScope, $scope, $state, pyroMaster, $window) {
  console.log('SignupCtrl');
  $showSignupAttemptedMessage = false;
	$scope.signupData = {};
  $scope.err = {};
  $scope.createAccount = function() {
  	console.log('[SignupCtrl] createAccount called');
    // [TODO] This should be a service and error checked.
    if($scope.signupData.hasOwnProperty('email') && $scope.signupData.hasOwnProperty('password')) {
      $window.ga('send','event', 'account-controller', 'CreateAccount', $scope.signupData.email);
      if($scope.signupData.password.length >= 8) {
        console.log('password long enough running getFirebaseAccount');
        getFirebaseAccount(function(newAccount){
          console.log('running pyroSignup');
          pyroSignup(function(pyroAccount){
            $state.go('home');
          });
        })
      } else {
        $scope.err = {message:'Password must be at least 8 characters'};
      }
      
    } else {
      $scope.err = {message:'Invalid login information'};
    }
  };
  function getFirebaseAccount(cb){
    pyroMaster.$getFbAccount($scope.signupData).then(function(account){
      console.warn('Firebase account exists and logged in successfully:', account);
      cb(account);
    }, function(err){
      if(err.status == 401) {
        //Firebase information is incorrect
        console.warn('Firebase login information does not match. Attempting to create a new Firebase account');
        createFirebaseAccount(function(account){
          cb(account);

        });
      } else {
        console.error('Error gettingFBAccount:', err);
        $scope.err = err;
      }
    });
  }
  function pyroSignup(cb){
    pyroMaster.$signup($scope.signupData).then(function(userAccount){
      console.log('[SignupCtrl] pyro signup successful:', userAccount);
      cb(userAccount);
    }, function(err){
      console.warn('Signup error:', err.message);
      $scope.err = err;
      if(err.code == 'EMAIL_TAKEN') {
        $scope.signupData.email = null;
      }
    });
  }
  function createFirebaseAccount(cb){
    pyroMaster.$createFbAccount($scope.signupData).then(function(userAccount){
      console.warn('Signup successful:', userAccount);
      cb(userAccount)
    }, function(err2){
      //email already belongs to a firebase account
      // [TODO] Redirect to a page to log into firebase account
      console.error('Firebase account error:', err2);
      $scope.err.message = 'Looks like a firebase account exists under that email. Login to manage your firebase instances with Pyro.'
    });
  }
  $scope.signupAttempt = function(){
    // Record Signup Attempt while signup is closed
    $scope.showSignupAttemptedMessage = true;
    pyroMaster.$createObject('betaAccountCreateAttempts', $scope.signupData.email).then(function(objectSnap){
      console.log('Signup attempted:', objectSnap);
    });
  };
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