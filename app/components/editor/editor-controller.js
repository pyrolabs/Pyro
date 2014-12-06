angular.module('pyroApp.controllers')
.controller('EditorCtrl', function($scope, $state, $rootScope, $stateParams, PyroArray, pyroMaster, editorService) {
  console.log('EditorCtrl');
  $scope.loading = {};
  $rootScope.instanceList = PyroArray('instances');
   $scope.instanceList.$loaded().then(function(pyroList){
    $scope.isLoading = false;
    console.log('scope set:', $scope.instanceList[0]);
    $scope.pyroInstance = pyroList[$stateParams.appId];
    // var loadParams = {Bucket:$scope.pyroInstance.name}
    //[TODO] Switch to call to editorService
    pyroMaster.$loadObject('appFiles', $scope.pyroInstance.name).then(function(returnedObject){
      $scope.files = returnedObject;
      console.log('$scope.files set:', $scope.files);
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
  $scope.loading.editor = true;
  $scope.aceLoaded = function(_editor){
    console.log('[EditorCtrl] Ace editor loaded successfully');
    $scope.editorObj = _editor;
    var _session = _editor.getSession();
    var _renderer = _editor.renderer;
    _session.setUndoManager(new ace.UndoManager());

    $scope.loading.editor = false;
    // _renderer.setShowGutter(false);
    // Editor Events
    // _editor.on("changeSession", function(){
    //   console.log('[EditorCtrl] Editor change session:', _editor);
    // });
    // _session.on("change", function(){
    //   console.log('[EditorCtrl] Session changed:', _session);
    // });
  }
  $scope.aceChanged = function(_editor){
    console.log('[EditorCtrl] Ace editor changed:', _editor);
    saveFileNewContent();
  }

  function saveFileNewContent() {
    if($scope.files.$currentFile) {
      console.log("File ",$scope.files.$currentFile, " changed, saving content.");
      $scope.files.$currentFile.newContent = $scope.editorObj.getValue();
    } else {
      $scope.files.$currentFile = {newContent:$scope.editorObj.getValue()};
    }
  }
  $scope.openFile = function(fileObject){
    console.log('path:', fileObject.path);
    $scope.files.$currentFile = fileObject;
    if(!fileObject.hasOwnProperty('content')){
      var bucketName = 'pyro-'+$scope.pyroInstance.name;
      var filePath = fileObject.path.replace('fs/pyro-'+$scope.pyroInstance.name+'/', '');
      editorService.downloadFileFromS3(bucketName, filePath).then(function(fileString){
        // Set file to editor
        $scope.editorObj.getSession().setValue(fileString);
        // Set file mode
        $scope.editorObj.getSession().setMode(getFileMode(fileObject));
      }, function(err){
        console.error('[EditorCtrl] Error downloding file from S3:', err);
        $scope.err = err;
      });
    } else {
      //file already exisits in object form in content
      $scope.editorObj.getSession().setValue(fileObject.content);
      $scope.editorObj.getSession().setMode(getFileMode(fileObject));
    }
  };
  function getFileMode(argFile){
    var fileMode = 'ace/mode/';
    // [TODO] add regex for file type 
    if(fileObject.hasOwnProperty('editorMode')){
      fileMode = fileMode + argFile.editorMode;
    } else {
      fileMode = fileMode + 'javascript';
    }
    return fileMode;
  }
  
})