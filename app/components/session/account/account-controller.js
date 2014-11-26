
angular.module('pyroApp.controllers')
.controller('SignupCtrl', function($rootScope, $scope, $state, pyroService) {
  console.log('SignupCtrl');
	$scope.signupData = {};
  $scope.err = {};
  $scope.createAccount = function() {
  	console.log('createAccount called');
    assertValidAccountProps();
    pyroService.signup($scope.signupData).then(function(userAccount){
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
    function assertValidAccountProps() {
      if( !$scope.signupData.email ) {
        $scope.err.message = 'Please enter an email address';
      }
      else if( !$scope.signupData.password || !$scope.signupData.confirm ) {
        $scope.err.message = 'Please enter a password';
      }
      else if($scope.signupData.password !== $scope.signupData.confirm ) {
        $scope.err.message = 'Passwords do not match';
        $scope.signupData.password = null;
        $scope.signupData.confirm = null;
      }
      return !$scope.err.message;
    }

    function errMessage(err) {
      return angular.isObject(err) && err.message? err.message : err + '';
    }
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