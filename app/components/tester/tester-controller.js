angular.module('pyroApp.controllers')

.controller('TesterCtrl', function($scope, $state, $rootScope, $stateParams, $sce, $document, instance) {
  console.log('TesterCtrl');
 
 
  $scope.emuRender = {
    url:'',
    width:'100%',
    height:'100%',
    topmargin:'0',
    type:'web'
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
    $scope.pyroInstance = instance;
    var s3Url = "https://"+ $scope.pyroInstance.appUrl.replace("s3-website-us-east-1", "s3")
    $scope.emuRender.url = $sce.trustAsResourceUrl(s3Url + "/index.html");
})