angular.module('pyroApp.controllers')

.controller('LandingCtrl', function($scope, $state, $rootScope, $stateParams, pyroMaster, $window) {
  console.log('LandingCtrl');

  $scope.pyroSymbolClicked = function() {
    $scope.betaUserData.createdAt = Date.now();
    if($scope.betaUserData.email){
    } else {
      $scope.betaUserData.email = 'undefined';
    }
    pyroMaster.$createObject('betaPyroSymbolClicks', $scope.betaUserData).then(function(objectSnap){
      console.log('Pyro symbol clicked:', objectSnap);
    });
  }
    
  $scope.betaSignup = function(){
  	console.log('betaSignup called');
  	// [TODO] Check for email in list before writing
  	if($scope.signupData.email){
  		console.log('signing up with email:');
      $scope.betaUserData.email = $scope.signupData.email;
  		// [TODO] Add error handling
  		pyroMaster.$createObject('betaSignups', $scope.signupData).then(function(returnedObj){
  			console.log('betaSignup object created successfully:', returnedObj);
  			//redirect to thank you page
        
        // Send Google Analytics Event for beta mailing setup
        // [TODO] This should be a service and error checked.
        $window.ga('send','event', 'beta', 'signup', $scope.signupData.email);

  			$state.go('betaThanks');
  		});
  	} else {
  		console.error('Enter a valid email address');
  		$scope.err = {message:'Enter a valid email address'};
  	}
  }

})