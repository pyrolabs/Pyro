angular.module('pyroApp.controllers')

.controller('TesterCtrl', function($scope, $state, $rootScope, $stateParams, $sce, $document, PyroArray) {
  console.log('TesterCtrl');
 
  $rootScope.instanceList = PyroArray('instances');
 
  $scope.emuRender = {
    url:'',
    width:'100%',
    height:'100%',
    topmargin:'0',
    type:'web'
  } 

  $scope.otherDash = function(ind){
    $state.go('dash',{appId:ind})
  }
  $scope.goToDash = function() {
    $state.go('dash',{appId: $stateParams.appId})
  }  
  $scope.goToBuilder = function() {
    $state.go('editor',{appId: $stateParams.appId})
  }
  $scope.goToTester = function() {
    $state.go('tester',{appId: $stateParams.appId})
  }


  $scope.setEmulator = function(emu) {
    $scope.emuRender.type = emu;
    if (emu==='iphone6') {
      console.log('Setting emulation mode to iphone6');
      setEmulatorSize('375','667','px');
    }
    else if (emu==='iphone5') {
      console.log('Setting emulation mode to iphone5');
      setEmulatorSize('320','568','px');
    }
    else {
      console.log('Setting emulation mode to web');
      setEmulatorSize('100','100','%');
    }
  }

  function setEmulatorSize(x,y,t) {
    // var emu = $document.getElementsByClassName("tester-container"));
    // console.log(emu);
    console.log(x+t,y+t)
    if(t=='px') {
      $scope.emuRender.width = x;
      $scope.emuRender.height = y;
    } else {
      $scope.emuRender.width = x+t;
      $scope.emuRender.height = y+t;
    }
  }

   $scope.instanceList.$loaded().then(function(pyroList){
      // [TODO] get pyro object by selecting from exisiting list
    $scope.isLoading = false;
    console.log('scope set:', $scope.instanceList[0]);
    $scope.pyroInstance = pyroList[$stateParams.appId]
    $scope.emuRender.url = $sce.trustAsResourceUrl('//'+$scope.pyroInstance.appUrl);
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