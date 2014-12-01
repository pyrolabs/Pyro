angular.module('pyroApp.controllers', ['pyroApp.services'])
.controller('RootCtrl', function($scope, $state, $rootScope, $stateParams, pyroMaster) {
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
	$scope.newAppData = {};
	$scope.err = {};
	$scope.loading = true;
	$scope.logout = function() {
		pyroMaster.$logout().then(function(){
			$scope.err.message = 'Logout Successful';
			$state.go('login');
		});
	};
})
.controller('NavbarCtrl', function($scope, $state, $rootScope, $stateParams, user, auth) {
  console.log('NavbarCtrl');
  console.log('user:', user);
  console.log('auth:', auth);
  $rootScope.account = user;
})
.filter('search', function(){
	// All filters must return a function. The first parameter
	// is the data that is to be filtered, and the second is an
	// argument that may be passed with a colon (searchFor:searchString)
	return function(arr, searchString){
		if(!searchString){
			return arr;
		}
		var result = [];
		searchString = searchString.toLowerCase();
		// Using the forEach helper method to loop through the array
		angular.forEach(arr, function(item){
			if(item.name.toLowerCase() == searchString){
				result.push(item);
			}
		});
		return result;
	};

});