angular.module('pyroApp.controllers')

.controller('InstanceListCtrl', function($scope, $state, $rootScope, pyroMaster, PyroArray, user, auth) {
  console.log('InstanceListCtrl');
  // Form data for the login modal
  $rootScope.auth = auth;
  $rootScope.account = user;
  $scope.newAppData = {};
  $scope.err = {};
  $scope.loading = true;
  $scope.cardClasses = ['bg-primary lt', 'bg-info lt', 'bg-success lter', 'bg-warning lter', 'bg-light dk'];
  // $rootScope.instanceList = instanceList;
  // Update instance list with any updates that happen after page load
  // pyroMaster.library.getListByAuthor('instances', function(returnedList){
  //   console.log('[InstanceListCtrl]instance list loaded:', returnedList);
  //   $rootScope.instanceList = returnedList;
  // });

  $rootScope.instanceList = PyroArray('instances');
  console.log('$rootScope.instanceList set:', $scope.instanceList);

  // [TODO] Use different objects for the different create types
  $scope.viewDetail = function(argInd) {
    console.log('viewDetail called with: ', argInd);
    console.log('loading:', $scope.instanceList[argInd]);
    $state.go('dash', {appId:argInd});
  }
  $scope.createInstance = function() {
  	console.log('createInstance called', $scope.newAppData);
    if($scope.newAppData.hasOwnProperty('name')){
      $scope.newAppData.url = "https://"+$scope.newAppData.name + ".firebaseio.com"
      pyroMaster.$createInstance($scope.newAppData).then(function(returnedInstance){
        console.log('[InstanceListCtrl]instance created successfully:', returnedInstance);
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
      pyroMaster.$generatePyro($scope.newAppData.name).then(function(returnedInfo){
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
      pyroMaster.$deleteObject('instances', argName);
    }
  }
})
.controller('InstanceCtrl', function($rootScope, $scope, PyroArray){
  console.log('[InstanceCtrl]');
    $scope.isLoading = true;
  
  $rootScope.instanceList = PyroArray('instances');
  $scope.instanceList.$loaded().then(function(pyroList){
      // [TODO] get pyro object by selecting from exisiting list
    $scope.isLoading = false;
    console.log('scope set:', $scope.instanceList[0]);
    $scope.pyroInstance = pyroList[$stateParams.appId]
    $scope.pyroInstance.getUserCount(function(userCount){
      $scope.userCount = userCount;
      if(!$scope.$$phase) {
        //$digest or $apply
        $scope.$apply();
      }
    });
    $scope.pyroInstance.getObjectCount('sessions',function(sessionCount){
      console.log('sessionCount updated:', sessionCount);
      $scope.sessionCount = sessionCount;
       if(!$scope.$$phase) {
        //$digest or $apply
        $scope.$apply();
      }
    });
  });
})