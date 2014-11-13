
angular.module('pyroApp.controllers')
.controller('SignupCtrl', function($rootScope, $scope, $state) {
  console.log('SignupCtrl');
	$scope.signupData = {};
  $scope.err = {};
  $scope.createAccount = function() {
  	console.log('createAccount called');
    $rootScope.pyro.signup($scope.signupData, function(userAccount) {
      console.log('signup + login successful:', userAccount);
      $state.go('home');
    }, function(err) {
      console.warn('pyroSignup returned:', err);
      $scope.err.message = err;
      // [TODO] Understand why fb error needs apply
      if(!$scope.$$phase) {
        //$digest is not in progress
        $scope.$apply();
      }
    });
  };

    function assertValidAccountProps() {
      if( !$scope.signupData.email ) {
        $scope.err = 'Please enter an email address';
      }
      else if( !$scope.signupData.password || !$scope.signupData.confirm ) {
        $scope.err = 'Please enter a password';
      }
      else if($scope.signupData.password !== $scope.signupData.confirm ) {
        $scope.err = 'Passwords do not match';
      }
      return !$scope.err;
    }

    function errMessage(err) {
      return angular.isObject(err) && err.code? err.code : err + '';
    }
})
.controller('AccountCtrl', function($rootScope, $scope, $state) {
      console.log('AccountCtrl');
      // create a 3-way binding with the user profile object in Firebase

      // expose logout function to scope
      $scope.logout = function() {
        $state.go('login');
      };

      $scope.changePassword = function(pass, confirm, newPass) {
        resetMessages();
        if( !pass || !confirm || !newPass ) {
          $scope.err = 'Please fill in all password fields';
        }
        else if( newPass !== confirm ) {
          $scope.err = 'New pass and confirm do not match';
        }
        else {
          
        }
      };

      $scope.changeEmail = function(pass, newEmail) {
        
      };

      function resetMessages() {
        $scope.err = null;
        $scope.msg = null;
        $scope.emailerr = null;
        $scope.emailmsg = null;
      }
});