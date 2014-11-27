
angular.module('pyroApp.controllers')
.controller('SignupCtrl', function($rootScope, $scope, $state, pyroMaster) {
  console.log('SignupCtrl');
	$scope.signupData = {};
  $scope.err = {};
  $scope.createAccount = function() {
  	console.log('createAccount called');
    pyroMaster.signup($scope.signupData).then(function(userAccount){
      console.log('Signup successful:', userAccount);
      $state.go('home');
    }, function(err){
      console.warn('Signup error:', err.message);
      $scope.err = err;
      if(err.code == 'EMAIL_TAKEN') {
        $scope.signupData.email = null;
      }
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