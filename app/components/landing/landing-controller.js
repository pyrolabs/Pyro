angular.module('pyroApp.controllers')

.controller('LandingCtrl', function($scope, $state, $rootScope, $stateParams, pyroMaster) {
  console.log('LandingCtrl');
  $scope.betaSignup = function(){
  	console.log('betaSignup called');
  	// [TODO] Check for email in list before writing
  	if($scope.signupData.email){
  		console.log('signing up with email:');
  		// [TODO] Add error handling
  		pyroMaster.createObject('betaSignups', $scope.signupData).then(function(returnedObj){
  			console.log('betaSignup object created successfully:', returnedObj);
  			//redirect to thank you page
  			$state.go('betaThanks');
  		});
  	} else {
  		console.error('Enter a valid email address');
  		$scope.err = {message:'Enter a valid email address'};
  	}
  }

})