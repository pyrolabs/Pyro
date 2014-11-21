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
  // Form data for the login screen
	$rootScope.instanceList = {};
	$scope.newAppData = {};
	$scope.err = {};
	$scope.loading = true;
  $scope.init = function() {
	 $rootScope.pyro.getListByAuthor('instances', function(returnedList){
	 	console.log('getInstances successful:', returnedList);
	 	$rootScope.instanceList = returnedList;
	 	$rootScope.$apply();
	 });
  };
	$scope.logout = function() {
		$rootScope.pyro.logout();
		$state.go('login');
	};
})