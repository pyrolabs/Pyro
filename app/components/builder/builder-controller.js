angular.module('pyroApp.controllers')

.controller('BuilderCtrl', function($scope, $state, $rootScope, $stateParams, PyroArray, pyroMaster) {
  console.log('BuilderCtrl');
 
  $rootScope.instanceList = PyroArray('instances');
  $scope.otherDash = function(ind){
    $state.go('dash',{appId:ind})
  }
  $scope.goToDash = function() {
    $state.go('dash',{appId: $stateParams.appId})
  }  
  $scope.goToBuilder = function() {
    $state.go('builder',{appId: $stateParams.appId})
  }
  $scope.goToTester = function() {
    $state.go('tester',{appId: $stateParams.appId})
  }
  $scope.goToExplorer = function() {
    $state.go('explorer',{appId: $stateParams.appId})
  }


   $scope.instanceList.$loaded().then(function(pyroList){
      // [TODO] get pyro object by selecting from exisiting list
    $scope.isLoading = false;
    console.log('scope set:', $scope.instanceList[0]);
    $scope.pyroInstance = pyroList[$stateParams.appId];
    // var loadParams = {Bucket:$scope.pyroInstance.name}
    // s3.listObjects()
    pyroMaster.$loadObject('appFiles', $scope.pyroInstance.name).then(function(returnedObject){
      $scope.files = returnedObject;
      console.log('$scope.files set:', $scope.files);
      if(!$scope.$$phase) {
        //$digest or $apply
        $scope.$apply();
      }
      loadEditor();
     });
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
     $scope.opts = {
         dirSelectable: false
     };




  // EDITOR
  $scope.dir = {};

  function loadEditor() {
    $scope.editorObj = ace.edit("build-editor");
    $scope.editorObj.on("change", function(){
      saveFileNewContent();
    });
  }
  function saveFileNewContent() {
    if($scope.files.$currentFile) {
      console.log("File ",$scope.files.$currentFile, " changed, saving content.");
      $scope.files.$currentFile.newContent = $scope.editorObj.getValue();
    }
  }
  $scope.loadEditorFile = function(file) {
    setCurrentFile();
    openCurrentFile();
    function setCurrentFile() {
      console.log("Setting editor $currentFileKey to ", file);
      $scope.files.$currentFile = file;
    }
    function openCurrentFile(){
      var fileMode = 'ace/mode/'
      if($scope.files.$currentFile.editorMode){
        fileMode = fileMode + $scope.files.$currentFile.editorMode
      } else {
        fileMode = fileMode + 'javascript'
      }
      $scope.editorObj.getSession().setMode(fileMode);
      if($scope.files.$currentFile.hasOwnProperty('newContent')) {
        $scope.editorObj.getSession().setValue($scope.files.$currentFile.newContent)
      } else {
        $scope.editorObj.getSession().setValue($scope.files.$currentFile.content)
      }
      $scope.editorObj.clearSelection();
    }
  }
  $scope.downloadFile = function(path){
    console.log('path:', path);
    AWS.config.update({
    accessKeyId: "AKIAITSZDS4HYX4YFOYA",
    secretAccessKey: "gA5Arf+6H8PfF4BgX6bUBrWjA6CGdvzMcIfQLWw3"
  });
    AWS.config.region = 'us-east-1'
    var params = {Bucket:'pyro-'+$scope.pyroInstance.name, Key:path.replace('fs/pyro-'+$scope.pyroInstance.name+'/', '')}
    console.log('params:', params);
    var s3 = new AWS.S3();
    s3.getObject(params, function(err, data){
      if(!err){
        console.log('object retreived successfully:', data.Body.toString());
      } else {
        console.error(err, err.stack);
      }
    });
  }
function getAsText(readFile) {
        
  var reader = new FileReader();
  
  // Read file into memory as UTF-16      
  reader.readAsText(readFile, "UTF-16");
  
  // Handle progress, success, and errors
  reader.onprogress = updateProgress;
  reader.onload = loaded;
  reader.onerror = errorHandler;
}
function updateProgress(evt) {
  if (evt.lengthComputable) {
    // evt.loaded and evt.total are ProgressEvent properties
    var loaded = (evt.loaded / evt.total);
    if (loaded < 1) {
      // Increase the prog bar length
      // style.width = (loaded * 200) + "px";
      console.log(loaded*200);
    }
  }
}

function loaded(evt) {  
  // Obtain the read file data    
  var fileString = evt.target.result;
  // Handle UTF-16 file dump
  console.log('loaded successfully:', fileString);
  // xhr.send(fileString)     
}

function errorHandler(evt) {
  if(evt.target.error.name == "NotReadableError") {
    // The file could not be read
  }
}
  
})