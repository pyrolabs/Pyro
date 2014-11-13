angular.module('pyroApp.controllers')

.controller('InstanceListCtrl', function($scope, $state, $rootScope) {
  console.log('InstanceListCtrl');
  // Form data for the login modal
 $scope.newAppData = {};
 $scope.err = {};
 $scope.loading = true;
 $scope.instanceList = {};

 $rootScope.pyro.getInstances(function(returnedList){
 	console.log('getInstances successful:', returnedList);
 	$scope.instanceList = returnedList;
 	$scope.loading = false;
 	$scope.$apply();
 });
  $scope.viewDetail = function(argId) {
    console.log('viewDetail called with: ', argId);
    console.log('loading:', $scope.instanceList[argId]);
    $state.go('dash', {appId:argId, instance:$scope.instanceList[argId]});
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
.controller('InstanceDetailCtrl', function($scope, $state, $rootScope, $stateParams) {
  console.log('AppDetailCtrl');
  var instanceInfo = {name:$stateParams.appId};
  $rootScope.pyro.loadInstance(instanceInfo, function(returnedInstance){
  	console.log('pyroInstance loaded:', returnedInstance);
  	$scope.pyroInstance = returnedInstance;
  	$scope.$apply();
  }, function(err){
  	$scope.err = err;
  	$scope.$apply();
  })

})