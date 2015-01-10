angular.module('pyroApp.controllers')

.controller('EditorCtrl', function($scope, $state, $rootScope, $stateParams, instance, editorService, pyroMaster, fileRam, $timeout) {
  console.log('EditorCtrl');
  // Set pyroInstance from resolve
  $scope.pyroInstance = instance;
  $scope.loading = {editor:true, structure:true};
  // Load folder stucture
  editorService.getFolderStructure($scope.pyroInstance.name).then(function(returnedStructure){
    console.log('folder structure returned:', returnedStructure);
    $scope.files = returnedStructure;
    $scope.loading.structure = false;
  }, function(){
    console.error('[EditorCtrl] error getting folder structure');
  });

  // EDITOR
  // Runs when ace editor is loaded

  $scope.aceLoaded = function(_editor){
    console.log('[EditorCtrl] Ace editor loaded successfully');
    var _session = _editor.getSession();
    var _renderer = _editor.renderer;
    _session.setUndoManager(new ace.UndoManager());
    $scope.editorObj = _editor;
    $scope.loading.editor = false;
    // _renderer.setShowGutter(false);
    // Editor Events
    // _editor.on("changeSession", function(){
    //   console.log('[EditorCtrl] Editor change session:', _editor);
    // });
    // _session.on("change", function(){
    //   console.log('[EditorCtrl] Session changed:', _session);
    // });
  };
  // Runs every time there is a change within ace editor
  $scope.aceChanged = function(_editor){
    console.log('[aceChanged] Ace editor changed:', _editor);
  };
  // Open file from list
  $scope.openFile = function(fileObject){
    if(fileObject){
      console.log('[$scope.openFile()] called with:', fileObject);
      $scope.currentFile = fileObject;
      editorService.openWithFirepad($scope.pyroInstance.name, fileObject, $scope.editorObj).then(function(returnedFirepad){
        console.log('firepad initialized and returned:', returnedFirepad);
      });
    }
  };
  // Save file to S3
  $scope.saveFile = function(){
    console.log('saveFile called');
    var bucketName = "";
    if($scope.pyroInstance.hasOwnProperty('bucketName')){
      bucketName = $scope.pyroInstance.bucketName;
    } else {
      bucketName = $scope.pyroInstance.name;
    }
    editorService.saveContentsToS3(bucketName, $scope.editorObj.getSession().getValue()).then(function(saveRes){
      console.warn('saveRes:', saveRes);
      //[TODO] Notify user of succesful save
      $scope.notification = $scope.currentFile.name + " was saved successfully";
    }, function(err){
      console.error('error saving file:',err);
      $scope.notification = "Error saving file";
      $scope.err = err;
    });
  };
  // Start creating a new folder
  $scope.startNewFolder = function(){
    //Show area to type in name of new folder
    $scope.showTextBox = true;
  }
  $scope.newFolder = function(){
    //Create new folder in app structure
    editorService.addNewFolder('test-folder', 'components', $scope.pyroInstance.name).then(function(){
      console.log('Folder created successfully');
    }, function(err){
      console.error('Error creating new folder:', err);
      $scope.err = err;
    });
  };
  // $scope.setFolderTreeState = function(state) {
  //   $scope.files.$collapsed = state;
  // };
  // $scope.toggleFolders = function() {
  //   $scope.files.$collapsed = !($scope.files.$collapsed);
  // };

})
