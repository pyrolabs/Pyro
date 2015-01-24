angular.module('pyroApp.controllers')

.controller('EditorCtrl', function($scope, $state, $rootScope, instance, editorService, pyroMaster, $timeout) {
  console.log('EditorCtrl');
  // Set pyroInstance from resolve
  $scope.pyroInstance = instance;
  $scope.loading = {editor:true, structure:true};
  $scope.err = null;
  $scope.notification = null;
  // Load folder stucture one time
  // editorService.getFolderStructure($scope.pyroInstance.name).then(function(returnedStructure){
  //   console.log('folder structure returned:', returnedStructure);
  //   $scope.files = returnedStructure;
  //   $scope.loading.structure = false;
  // }, function(err){
  //   console.error('[EditorCtrl] error getting folder structure');
  //   $scope.err = err;
  // });
  editorService.bindFolderStructure($scope.pyroInstance.name, $scope, 'files').then(function(){
    console.log('folder structure returned:', $scope.files);
    $scope.loading.structure = false;
  }, function(err){
    console.error('[EditorCtrl] error binding folder structure');
    $scope.err = err;
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
    if(fileObject && fileObject.type == 'file'){
      console.log('[$scope.openFile()] called with:', fileObject);
      $scope.currentFile = fileObject;
      editorService.openWithFirepad($scope.pyroInstance.name, fileObject, $scope.editorObj).then(function(returnedFirepad){
        console.log('firepad initialized and returned:', returnedFirepad);
      }, function(err){
        $scope.err = err;
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
      bucketName = "pyro-" + $scope.pyroInstance.name;
    }
    editorService.saveFile(bucketName, $scope.currentFile.path, $scope.editorObj.getSession().getValue()).then(function(saveRes){
      console.warn('saveRes:', saveRes);
      //[TODO] Notify user of succesful save
      $scope.notification = $scope.currentFile.name + " was saved successfully";
    }, function(err){
      console.error('error saving file:',err);
      $scope.err = err;
    });
  };
  // Start creating a new folder
  $scope.startNewFolder = function(){
    //Show area to type in name of new folder
    $scope.createItem = {mode:"folder", placeholder:"components/new-folder"};
  };
  $scope.startNewFile = function(){
    //Show area to type in name of new folder
    $scope.createItem = {mode:"file", placeholder:"components/home/new-file.html"};
  }
  $scope.newFolder = function(){
    //Create new folder in app structure
    if($scope.createItem && $scope.createItem.hasOwnProperty('path')){
      editorService.addNewItemToStructure('folder', $scope.createItem.path, $scope.pyroInstance.name).then(function(){
        console.log('Folder created successfully');
        notify("New folder created successfully");
      }, function(err){
        console.error('Error creating new folder:', err);
        $scope.err = err;
      });
    } else {
      $scope.err = {message:'Path needed to create new folder', error:"INVALID_PATH"};
    }
  };
  $scope.newFile = function(){
    //Create new file in app structure
    if($scope.createItem && $scope.createItem.hasOwnProperty('path')){
      editorService.addNewItemToStructure('file', $scope.createItem.path, $scope.pyroInstance.name).then(function(){
        console.log('File created successfully');
        notify('File saved successfully');
      }, function(err){
        console.error('Error creating new file:', err);
        $scope.err = err;
      });
    } else {
      $scope.err = {message:'Path needed to create new file', error:"INVALID_PATH"};
    }
  };
  // Notify content for certain time of seconds
  function notify(argContent, argTime){
    var notificationTime = 3;
    $scope.notification = argContent;
    if(argTime){
      notificationTime = argTime;
    }
    $timeout(function(){
      $scope.notification = null;
    }, notificationTime * 1000); //Convert time to ms for timeout
  }
  // $scope.setFolderTreeState = function(state) {
  //   $scope.files.$collapsed = state;
  // };
  // $scope.toggleFolders = function() {
  //   $scope.files.$collapsed = !($scope.files.$collapsed);
  // };

})
