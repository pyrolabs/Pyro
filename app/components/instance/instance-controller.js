angular.module('pyroApp.controllers')

.controller('InstanceListCtrl', function($scope, $state, $rootScope, pyroMaster, instanceList) {
  console.log('InstanceListCtrl');
  // Form data for the login modal
  $scope.newAppData = {};
  $scope.err = {};
  $scope.loading = true;
  $scope.cardClasses = ['bg-primary lt', 'bg-info lt', 'bg-success lter', 'bg-warning lter', 'bg-light dk'];
  // $rootScope.instanceList = instanceList;
  // Update instance list with any updates that happen after page load
  pyroMaster.library.getListByAuthor('instances', function(returnedList){
    $rootScope.instanceList = returnedList;
  });
  // [TODO] Use different objects for the different create types
  console.log('instanceList loaded:', instanceList)
  $scope.viewDetail = function(argName) {
    console.log('viewDetail called with: ', argName);
    console.log('loading:', $rootScope.instanceList[argName]);
    $state.go('dash', {appId:$rootScope.instanceList[argName].name});
  }
  $scope.createInstance = function() {
  	console.log('createInstance called', $scope.newAppData);
    if($scope.newAppData.hasOwnProperty('name')){
      $scope.newAppData.url = "https://"+$scope.newAppData + "firebaseio.com"
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
  $scope.simpleSetup = function(){
    console.log('[InstanceListCtrl] simpleSetup called:');
    if($scope.newAppData && $scope.newAppData.hasOwnProperty('name')){
      pyroMaster.newPyroInstance($scope.newAppData.name).then(function(returnedInfo){
        console.log('[InstanceListCtrl] newPyroInstance successful with:', returnedInfo );
        $state.go('dash', {appId:$scope.newAppData.name});
      }, function(err){
        console.error('[InstanceListCtrl] error creating new instance:', err);
        $scope.err = err;
      });
    }

  }
  $scope.startDelete = function(argName){
    console.log('[InstanceListCtrl] startDelete called');
    var r = confirm("Are you sure you want to delete this app?");
    if(r == true) {
      console.log('confirm was true, deleteing:', argName);
      pyroMaster.deleteObject('instances', argName);
    }
  }
})