angular.module('pyroApp.controllers')

.controller('InstanceListCtrl', function($scope, $state, $rootScope) {
  console.log('InstanceListCtrl');
  // Form data for the login modal
 $scope.newAppData = {};
 $scope.err = {};
 $scope.loading = true;
 $scope.cardClasses = ['bg-primary lt', 'bg-info lt', 'bg-success lter', 'bg-warning lter', 'bg-light dk'];
  $scope.viewDetail = function(argId) {
    console.log('viewDetail called with: ', argId);
    console.log('loading:', $scope.instanceList[argId]);
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
  	});
  }
})