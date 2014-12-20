angular.module('pyroApp.controllers', ['pyroApp.services', 'treeControl', 'angulartics'])
.controller('RootCtrl', function($scope, $state, $rootScope, $stateParams, pyroMaster, PyroArray, $analytics) {
  console.log('RootCtrl');
  $scope.inDash = false;
  $rootScope.currentState = {};
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
	$scope.loading = {};
  $rootScope.instanceList;

	$scope.logout = function() {
		pyroMaster.$logout().then(function(){
      $analytics.eventTrack('User Logout', {category:'Session'});
			$scope.err.message = 'Logout Successful';
			$state.go('login');
		});
	};


  $scope.betaUserData = {};
  $scope.betaUserData.createdAt = '';
  $scope.betaUserData.email = '';
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

  $scope.otherDash = function(ind){
    $state.go('dash',{appId:ind})
  }
  $scope.goToDash = function() {
    $state.go('dash',{appId: $stateParams.appId})
  }  
  $scope.goToEditor = function() {
    $state.go('editor',{appId: $stateParams.appId})
  }
  $scope.goToTester = function() {
    $state.go('tester',{appId: $stateParams.appId})
  }
  $scope.goToData = function() {
    $state.go('data',{appId: $stateParams.appId})
  }
  
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