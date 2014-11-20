angular.module('pyroApp.controllers', [])
.controller('RootCtrl', function($scope, $state, $rootScope, $stateParams) {
  console.log('RootCtrl');
  $scope.inDash = false;
  // Watch for dash state
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){ 
    if(toState.name == 'dash') {
    	$scope.inDash = true;
  	} else {
  		$scope.inDash = false;
  	}
  });

      $scope.init = function() {
    	 $rootScope.pyro.getInstances(function(returnedList){
			 	console.log('getInstances successful:', returnedList);
			 	$rootScope.instanceList = returnedList;
			 	$rootScope.$apply();
			 });
      }
  // Form data for the login modal
	 $scope.newAppData = {};
	 $scope.err = {};
	 $scope.loading = true;
	 $rootScope.instanceList = {};
})