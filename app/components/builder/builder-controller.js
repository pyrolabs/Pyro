angular.module('pyroApp.controllers')

.controller('BuilderCtrl', function($scope, $state, $rootScope, $stateParams) {
  console.log('BuilderCtrl');
 
  $scope.goToDash = function() {
    $state.go('dash',{appId: $stateParams.appId})
  }  
  $scope.goToBuilder = function() {
    $state.go('builder',{appId: $stateParams.appId})
  }

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