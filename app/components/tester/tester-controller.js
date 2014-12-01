angular.module('pyroApp.controllers')

.controller('TesterCtrl', function($scope, $state, $rootScope, $stateParams, $sce, $document) {
  console.log('TesterCtrl');
 
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
    $scope.getS3Bucket($scope.pyroInstance.appUrl)
    $state.go('builder',{appId: $stateParams.appId})
  }
  $scope.goToTester = function() {
    $state.go('tester',{appId: $stateParams.appId})
  }

  $scope.getS3Bucket = function(appUrl) {
    var re = /(.+)(?=\.s3)/g;
    var reRegion = /website-(us.+)(?=\.amazon)/g;
    var bucketArray = appUrl.match(re);
    var regionArray = appUrl.match(reRegion);
    var endIdx = bucketArray.indexOf('amazonaws');
    console.warn("bucket: ",bucketArray,"region: ",regionArray);
    var bucketString = bucketArray[0]
    console.warn("bucket: ",bucketString);
    $scope.bucketString = bucketString;

    AWS.config.region = 'us-east-1';
    AWS.config.credentials = {accessKeyId: 'AKIAIVYKHOABJTUB7YKA', secretAccessKey: '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'};
    var bucket = new AWS.S3({params: {Bucket: 'pyro-test-01'}});
    bucket.listObjects(function (err, data) {
      if (err) {
        console.log('Could not load objects from S3 - ',err);
      } else {
        console.log('Loaded ' + data.Contents.length + ' items from S3');
        for (var i = 0; i < data.Contents.length; i++) {
          console.log(data.Contents[i].Key);
        }
      }
    });
  }

  $scope.getS3BucketContents = function(bucketName) {}

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
    $scope.emuRender.url = $sce.trustAsResourceUrl('http://'+$scope.pyroInstance.appUrl);
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