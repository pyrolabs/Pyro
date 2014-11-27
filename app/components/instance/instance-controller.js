angular.module('pyroApp.controllers')

.controller('InstanceListCtrl', function($scope, $state, $rootScope, pyroMaster, instanceList) {
  console.log('InstanceListCtrl');
  // Form data for the login modal
  $scope.newAppData = {};
  $scope.err = {};
  $scope.loading = true;
  $scope.cardClasses = ['bg-primary lt', 'bg-info lt', 'bg-success lter', 'bg-warning lter', 'bg-light dk'];
  $rootScope.instanceList = instanceList;
  console.log('instanceList loaded:', instanceList)
  $scope.viewDetail = function(argName) {
    console.log('viewDetail called with: ', argName);
    console.log('loading:', $rootScope.instanceList[argName]);
    $state.go('dash', {appId:$rootScope.instanceList[argName].name});
  }
  $scope.createInstance = function() {
  	console.log('createInstance called', $scope.newAppData);
    if($scope.newAppData.hasOwnProperty('url')){
      pyroMaster.createObject('instances', $scope.newAppData, function(returnedInstance){
        console.log('instance created successfully:', returnedInstance);
        $state.go('dash', {appId:returnedInstance.key()});
      }, function(err){
        console.error('error creating instance:', err);
        $scope.err = err;
      });
    }
  	else {
      $scope.err = {message:'Please enter a url for your new instance'};
    }
  }
})