angular.module('pyroApp.controllers')

.controller('InstanceListCtrl', function($scope, $state, $rootScope) {
  console.log('InstanceListCtrl');
  // Form data for the login modal
 $scope.newAppData = {};
 $scope.err = {};
  $scope.viewDetail = function(argId) {
    console.log('viewDetail called with: ', argId);
    console.log('loading:', $scope.list.$getRecord(argId));
    $state.go('dash', {appId:argId});
  }
  $scope.createInstance = function() {
  	console.log('createInstance called', $scope.newAppData);
  	$rootScope.pyro.createInstance($scope.newAppData, function(returnedInstance){
  		console.log('instance created successfully:', returnedInstance);
  		$state.go('dash', {appId:returnedInstance.key()});
  	}, function(err){
  		console.error('error creating instance:', err);
  		$scope.err = err;

  	})
  }
})
.controller('InstanceDetailCtrl', function($scope, $state, $rootScope, $stateParams) {
  console.log('AppDetailCtrl');
})