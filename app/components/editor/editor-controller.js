angular.module('pyroApp.controllers')

.controller('EditorCtrl', function($scope, $state, $rootScope, $stateParams, instance, editorService, pyroMaster, fileRam) {
  console.log('EditorCtrl');
 
    $scope.pyroInstance = instance;
    function seperateS3Url(argUrl){
      console.log('seperateS3Url called with', argUrl);
      var re = /(.+)(?=\.s3)/g;
      var bucketArray = argUrl.match(re);
      var bucketString = bucketArray[0]
      console.warn("bucket: ", bucketString);
      return bucketString;
    }
    editorService.getFolderStructure($scope.pyroInstance.name).then(function(returnedStructure){
      console.log('folder structure returned:', returnedStructure);
      $scope.files = returnedStructure;
    }, function(){
      console.error('[EditorCtrl] error getting folder structure');
    });

//     pyroMaster.$loadObject('appFiles', $scope.pyroInstance.name).then(function(returnedObject){
//       if(returnedObject){
//         $scope.files = returnedObject;
//         console.log('$scope.files set:', $scope.files);

//         if(!$scope.$$phase) {
//           //$digest or $apply
//           $scope.$apply();
//         }
//       } else {
//         console.error('Error loading file stucture from firebase.');
//         $scope.err = {message:'Error loading file structure'};
//       }
//      });



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
    // setup ram to store file content in real time
    fileRam("pyro-" + $scope.pyroInstance.name).$bindTo($scope, 'appRam').then(function(){
      $scope.loading.appRam = false;
      console.log('$scope.appRam bound:', $scope.appRam);
    });
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
    function saveFileNewContent() {
    // [TODO] Handle non generated app bucket name

      console.log("File ",$scope.appRam.$currentFile, " changed, saving content.");
      $scope.appRam.$currentFile.newContent = $scope.editorObj.getValue();

      var filePath = $scope.appRam.$currentFile.path.replace('fs', '');
      filePath = filePath.replace($scope.appRam.$currentFile.name, '')
      var newFileName = $scope.appRam.$currentFile.name.replace('.', ':');
      console.warn("\n\nFILE PATH: ",filePath+newFileName)

      // Get the full path with : substitution
      var finalRef = filePath+newFileName;

      // Break it down by '/'
      var finalRefArray = finalRef.split('/');
      console.warn("\n\nfinalRefArray: ",finalRefArray)

      var finalPropertyLocation = [];

      finalRefArray.shift();  // rid of first element
      finalRefArray.shift();  // rid of first element
      finalRefArray = finalRefArray.join(':');
      console.log("final ref is ",finalRefArray);

      if($scope.appRam[finalRefArray]){
      console.warn("EXISTING: ",filePath)

        $scope.appRam[finalRefArray].content = $scope.editorObj.getValue();
      } else {
      console.warn("NEW: ",filePath)
        $scope.appRam[finalRefArray] = {content: $scope.editorObj.getValue(), filetype:$scope.appRam.$currentFile.filetype, path:$scope.appRam.$currentFile.path};
      }

  }
  var aceModulo = 0;
  $scope.aceChanged = function(_editor){
    console.log('[EditorCtrl] Ace editor changed:', _editor);
    aceModulo++;
    if (aceModulo % 2 == 0 && $scope.appRam.$currentFile) {
    saveFileNewContent();
    }
  }
$scope.saveFile = function(){
  console.log('saveFile called');
  var bucketName = "";
  if($scope.pyroInstance.hasOwnProperty('bucketName')){
    bucketName = $scope.pyroInstance.bucketName;
  } else {
    bucketName = $scope.pyroInstance.name;
  }
// <<<<<<< Updated upstream
  editorService.saveContentsToS3(bucketName, $scope.appRam.$currentFile.path).then(function(saveRes){
        console.warn('saveRes:', saveRes);
  //   // Notify user of succesful save
// =======
//   editorService.saveFile(bucketName, $scope.files.$currentFile.path, $scope.editorObj.getValue(), 'simplelogin:34').then(function(saveRes){
//     console.log('saveRes:', saveRes);
// >>>>>>> Stashed changes
  }, function(err){
    console.error('error saving file:',err);
    $scope.err = err;
  })
  // editorService.saveFile(bucketName, $scope.files.$currentFile.path, $scope.editorObj.getValue()).then(function(saveRes){
  //   console.log('saveRes:', saveRes);
  //   // Notify user of succesful save
  // }, function(err){
  //   console.error('error saving file:',err);
  //   $scope.err = err;
  // });
}

   $scope.collapseFolders = function() {
    $scope.files.$collapsed = !($scope.files.$collapsed);
  }
  $scope.openFile = function(fileObject){
    

    if($scope.appRam.$currentFile) {
      saveFileNewContent();
    }

    if(fileObject){
    console.log('\n[editorCtrl $openFile()]OPEN FILE:', fileObject);
    fileObject.key = fileObject.name.replace('.', ':');
    $scope.appRam.$currentFile = fileObject;

    var filePath = fileObject.path.replace('pyro-'+$scope.pyroInstance.name+'/', '');
    filePath = filePath.replace('fs/', '');
    var storageKey = fileObject.name.replace('.', ':');
    console.log('appRam set with open file:', $scope.appRam);
    
    filePath = fileObject.path.replace('fs', '');
    console.warn("\n\nFILE PATH: ",filePath)

    if(!fileObject.hasOwnProperty('content') && !$scope.appRam.hasOwnProperty(storageKey)){
      editorService.downloadFileFromS3($scope.pyroInstance.name, filePath).then(function(fileString){
        // Set file to editor
        console.log('editorService.downloadFileFromS3 returned: ', fileString);
        $scope.editorObj.getSession().setValue(fileString);
        // Set file mode
        $scope.editorObj.getSession().setMode(getFileMode(fileObject));
        $scope.appRam[storageKey] = {content:fileString, filetype:fileObject.filetype, key:storageKey};
        console.log('newly downloaded file set to appRam:', $scope.appRam);
      }, function(err){
        console.error('[EditorCtrl] Error downloding file from S3:', err);
        $scope.err = err;
      });
    } else if ($scope.appRam && $scope.appRam.hasOwnProperty(storageKey)){
      var fileRam = $scope.appRam[storageKey];
      console.log('bound object is already found for that file:', fileRam);
      $scope.editorObj.getSession().setValue(fileRam.content);
      $scope.editorObj.getSession().setMode(getFileMode(fileRam));
    } else {
      //file already exisits in object form in content
      console.log('fileObject contains a content property');
      $scope.appRam[storageKey] = fileObject;
      $scope.editorObj.getSession().setValue(fileObject.content);
      $scope.editorObj.getSession().setMode(getFileMode(fileObject));
    }
    $scope.files.$collapsed = false;
    } else {
      console.error('File object does not exist');
    }
    
  };
  function getFileMode(argFile){
    var fileMode = 'ace/mode/';
    // [TODO] add regex for file type 
    if(argFile.hasOwnProperty('filetype')){
      fileMode = fileMode + argFile.filetype;
    }
    return fileMode;
  }
  
  
})