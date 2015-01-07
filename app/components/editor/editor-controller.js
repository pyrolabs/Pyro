angular.module('pyroApp.controllers')

.controller('EditorCtrl', function($scope, $state, $rootScope, $stateParams, instance, editorService, pyroMaster, fileRam, $timeout) {
  console.log('EditorCtrl');
  // Set pyroInstance from resolve
  $scope.pyroInstance = instance;

  // Load folder stucture
  editorService.getFolderStructure($scope.pyroInstance.name).then(function(returnedStructure){
    console.log('folder structure returned:', returnedStructure);
    $scope.files = returnedStructure;
  }, function(){
    console.error('[EditorCtrl] error getting folder structure');
  });

  $scope.opts = {
     dirSelectable: false
  };
  $scope.startNewFolder = function(){
    //Show area to type in name of new folder
  }
  $scope.newFolder = function(){
    //Create new folder in app structure
    editorService.addNewFolder('test-folder', 'components', $scope.pyroInstance.name).then(function(){
      console.log('Folder created successfully');
    }, function(err){
      console.error('Error creating new folder:', err);
      $scope.err = err;
    })
  };
  // EDITOR
  $scope.dir = {};
  // $scope.loading.editor = true;
  // $scope.setFolderTreeState(true);
  var auth = pyroMaster.mainRef.getAuth();
  var editor = ace.edit('firepad');
  editor.setTheme("ace/theme/monokai");
  var firepadRef = pyroMaster.mainRef.child('instances').child(instance.name).child('editor');
  //// Create Firepad.
  if(auth) {
    var firepad = Firepad.fromACE(firepadRef, editor, { userId:auth.uid
    });
  }

  $scope.aceLoaded = function(_editor){
    console.log('[EditorCtrl] Ace editor loaded successfully');
    $scope.editorObj = _editor;
    var _session = _editor.getSession();
    var _renderer = _editor.renderer;
    // _session.setUndoManager(new ace.UndoManager());
    _session.setUseWorker(false);
    // setup ram to store file content in real time
    //// Initialize Firebase.

    // fileRam("pyro-" + $scope.pyroInstance.name).$bindTo($scope, 'appRam').then(function(){
    //   $scope.loading.appRam = false;
    //   console.log('$scope.appRam bound:', $scope.appRam);
    // });
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
  $scope.aceChanged = function(_editor){
    console.log('[aceChanged] Ace editor changed:', _editor);
    $timeout(function(){
      saveFileNewContent();
    }, 200);
  };
  $scope.saveFile = function(){
    console.log('saveFile called');
    var bucketName = "";
    if($scope.pyroInstance.hasOwnProperty('bucketName')){
      bucketName = $scope.pyroInstance.bucketName;
    } else {
      bucketName = $scope.pyroInstance.name;
    }
    editorService.saveContentsToS3(bucketName, $scope.appRam.$currentFile.path).then(function(saveRes){
      console.warn('saveRes:', saveRes);
      //[TODO] Notify user of succesful save
      $scope.notification = $scope.appRam.$currentFile.name + " was saved successfully";
    }, function(err){
      console.error('error saving file:',err);
      $scope.notification = "Error saving file";
      $scope.err = err;
    })
  };
  $scope.setFolderTreeState = function(state) {
    $scope.files.$collapsed = state;
  };
  $scope.toggleFolders = function() {
    $scope.files.$collapsed = !($scope.files.$collapsed);
  };
  $scope.openFile = function(fileObject){
    if(fileObject){
      console.log('[$scope.openFile()] called with:', fileObject);
      $scope.appRam.$currentFile = fileObject;
      var actualFilePath = unstringifyPath(fileObject);
      if(!fileObject.hasOwnProperty('content') && !$scope.appRam.hasOwnProperty(actualFilePath)){
        editorService.downloadFileFromS3($scope.pyroInstance.name, fileObject.path).then(function(fileString){
          // Set file to editor
          console.log('[$scope.openFile()] editorService.downloadFileFromS3 returned: ', fileString);
          $scope.editorObj.getSession().setValue(fileString);
          // Set file mode
          $scope.editorObj.getSession().setMode(getFileMode(fileObject));
          $scope.appRam[actualFilePath] = {content:fileString, filetype:fileObject.filetype, key:actualFilePath};
          console.log('[$scope.openFile()] newly downloaded file set to appRam:', $scope.appRam);
        }, function(err){
          console.error('[$scope.openFile()] Error downloding file from S3:', err);
          $scope.err = err;
        });
      } else if ($scope.appRam && $scope.appRam.hasOwnProperty(actualFilePath)){
        var fileRam = $scope.appRam[actualFilePath];
        console.log('[$scope.openFile()] bound object is already found for that file:', fileRam);
        $scope.editorObj.getSession().setValue(fileRam.content);
        $scope.editorObj.getSession().setMode(getFileMode(fileRam));
      } else {
        //file already exisits in object form in content
        console.log('[$scope.openFile()] fileObject contains a content property');
        $scope.appRam[actualFilePath] = fileObject;
        $scope.editorObj.getSession().setValue(fileObject.content);
        $scope.editorObj.getSession().setMode(getFileMode(fileObject));
      }
      $scope.files.$collapsed = false;
    } else {
      console.error('[$scope.openFile()] File object does not exist');
    }
  };
  function saveFileNewContent() {
    // [TODO] Handle non generated app bucket name
    console.log("File ",$scope.appRam.$currentFile, " changed, saving content.");
    $scope.appRam.$currentFile.content = $scope.editorObj.getValue();
    var filePath = stringifyPath($scope.appRam.$currentFile);
    if($scope.appRam[filePath]){
      console.log("[saveFileNewContent]: file path exists in ram: ", filePath);
      $scope.appRam[filePath].content = $scope.editorObj.getValue();
    } else {
      console.log("[saveFileNewContent]: file path exists in ram: ",filePath)
      $scope.appRam[filePath] = {content: $scope.editorObj.getValue(), filetype:$scope.appRam.$currentFile.filetype, path:$scope.appRam.$currentFile.path};
    }
  }
  function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
  }
  //[TODO] These functions should be prototypes of an angularfire object
  function stringifyPath(argFile) {
    // Remove fs from path
    console.log('[stringifyPath] called with:', argFile);
    var strPath = argFile.path.replace('fs', '');
    // remove app name
    strPath = strPath.replace(argFile.name, '');
    var newFileName = argFile.name.replace('.', ':');
    // Full path with : substitution
    var finalRef = strPath+newFileName;
    // Break it down by '/'
    var finalRefArray = finalRef.split('/');
    console.warn("[stringifyPath] FinalRefArray: ",finalRefArray);
    finalRefArray.shift();  // rid of first element
    finalRefArray.shift();  // rid of second element
    finalRefArray = finalRefArray.join(':');
    console.log('[stringifyPath] finalRefStr:', finalRefArray);
    return finalRefArray;
  }
  function unstringifyPath(argFile){
    // Remove fs from path
    console.log('[unstringifyPath] called with:', argFile);
    var actualFilePath = argFile.path.replace('fs/pyro-'+$scope.pyroInstance.name+'/', '');
    console.log('[unstringifyPath] removed app name and fs:', actualFilePath);
    actualFilePath = replaceAll('/', ':', actualFilePath);
    console.log('[unstringifyPath] removed backslashes:', actualFilePath);
    actualFilePath = actualFilePath.replace('.', ':');
    console.log('[unstringifyPath] replaced . :', actualFilePath);
    return actualFilePath;
  }
  function getFileMode(argFile){
    var fileMode = 'ace/mode/';
    // [TODO] add regex for file type
    if(argFile.hasOwnProperty('filetype')){
      fileMode = fileMode + argFile.filetype;
    }
    return fileMode;
  }


      // function seperateS3Url(argUrl){
    //   console.log('seperateS3Url called with', argUrl);
    //   var re = /(.+)(?=\.s3)/g;
    //   var bucketArray = argUrl.match(re);
    //   var bucketString = bucketArray[0]
    //   console.warn("bucket: ", bucketString);
    //   return bucketString;
    // }
})
