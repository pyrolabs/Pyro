angular.module('pyroApp.controllers')

.controller('DashCtrl', function($scope, $state, $rootScope, $stateParams, instance, pyroMaker, user, pyroMaster) {
  console.log('DashCtrl');
  console.log('Instance loaded:', instance);
  $rootScope.account = user;
  $scope.pyroInstance = instance;
  $scope.pyroInstance.name = instance.name;

  if(instance.hasOwnProperty('dbUrl')){
    pyroMaster.library.loadObject('instances', instance.name, function(loadedInstance){
      console.log('pyroInstance loaded');
      $scope.pyroInstance = loadedInstance;
    })
    
  }
  var instancePyro = pyroMaker(instance.dbUrl);
  console.log('scope set:', $scope.pyroInstance);
  $scope.userCount = instancePyro.getObjectCount('users').then(function(count){
  	$scope.userCount = count;
  });
  instancePyro.getObjectCount('sessions').then(function(sessionCount){
  	$scope.sessionCount = sessionCount;
  });

  
})