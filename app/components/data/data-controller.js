angular.module('pyroApp.controllers')

.controller('DataCtrl', function($scope, $state, $rootScope, $window, instance, pyro, instanceData) {
  console.log('DataCtrl');
  $scope.pyroInstance = pyro(instance);
  _.each(instanceData, function(list){
    list.$size = _.size(list);
    // _.each(list, function(child){
      // child.$size = _.size(child);
    // });
  });
  $scope.jsonData = instanceData;
  console.log('pyroInstance: ',$scope.pyroInstance);
  console.log('instace data loaded:', instanceData);
  // $scope.instanceList = PyroArray('instances');
  // $scope.instanceList.$loaded().then(function(pyroList) {
  //   // [TODO] get pyro object by selecting from exisiting list
  //   $scope.isLoading = false;
  //   console.log('scope set:', $scope.instanceList.$getRecord($stateParams.appId));
  //   $scope.pyroInstance = $scope.instanceList.$getRecord($stateParams.appId);
  //   var appFb = new Firebase($scope.pyroInstance.dbUrl);
  //   appFb.on('value', function(pyroSnap){
  //     $scope.jsonData = pyroSnap.val();
  //     console.log('pyro data:', $scope.jsonData);
  //   });
  // });


})