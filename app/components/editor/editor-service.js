angular.module('editor.service', ['pyro.service', 'pyroApp.config'])
.factory('editorService',function($q, $http, pyroMaster, SERVERURL){
  const folderStuctureLocation = 'appFiles';
  const fileStorageLocation = 'appRam'
  const dataLocation = 'alphaData';
  const credsLocation = 's3Creds';
  const uploadFileEndpoint = SERVERURL + "/app/upload"
  var firepad = null;

	return{
		// saveFile:function(argBucketName, argFilePath, argFileContents){
		// 	console.log('[editorService] saveFile called', arguments);
  //     var deferred = $q.defer();
  //     var saveParams = {Bucket:argBucketName, Key:argFilePath,  Body: argFileContents};
  //     s3.putObject(saveParams, function(err, data){
  //       if(!err){
  //         console.log('file saved successfully');
  //         deferred.resolve(data);
  //       } else {
  //         console.log('error saving file:', err);
  //         deferred.reject(err);
  //       }
  //     });
  //     return deferred.promise;
		// },
    //Open file using ace editor and firepad
    openWithFirepad:function(argAppName, argFileObject, argEditor){
      var deferred = $q.defer();
      var self = this;
      var auth = pyroMaster.getAuth();
      var fileObject = argFileObject;
      fileObject.pathStr = stringifyPath(fileObject, argAppName);
      // Remove Extra stuff left from server
      fileObject.path = fileObject.path.replace("fs/pyro-"+argAppName+"/", "");
      if(auth){
        //User is authenticated
        var firepadRef = pyroMaster.mainRef.child(fileStorageLocation).child(argAppName).child(fileObject.pathStr);
        //Check if firepad exists
        if(firepad){
          console.log('[initializeFirepad] firepad already exists');
          // Disconnect old firepad session
          firepad.dispose();
          // Empty out editor
          argEditor.getSession().setValue(null);
        }
        // Setup new Firepad
        firepad = Firepad.fromACE(firepadRef, argEditor, {userId:auth.uid});
        //Set File mode in editor
        argEditor.getSession().setMode(getFileMode(fileObject));
        // Wait for firepad to be ready
        firepad.on('ready', function(){
          //Check for existing file contents at ref
          if(firepad.isHistoryEmpty()){
            // File does not already exist
            console.log('[initializeFirepad] File does not already exist');
            self.downloadFileFromS3(argAppName, argFileObject.path).then(function(fileContentString){
              console.log('[initializeFirepad] File contents returned', fileContentString);
              firepad.setText(fileContentString);
              deferred.resolve(firepad);
            }, function(err){
              deferred.reject(err);
            });
          } else {
            // File already exists
            console.log('[initializeFirepad]  File already exists');
            deferred.resolve(firepad);
          }
        });
      } else {
        // Not Authenticated
        var err = {message:'You must be logged in to use the editor.', error:'AUTH_REQUIRED'};
        console.error(err.message);
        deferred.reject(err);
      }
      return deferred.promise;
    },
    saveContentsToS3:function(argAppName, argFilePath){
      var auth = pyroMaster.getAuth();
      if(!auth) {
        console.error('Not logged in');
        deferred.reject({message:'Not logged in'});
      }
      argFilePath = argFilePath.replace('fs', '');
      var postObj = {name:argAppName, filePath:argFilePath, uid:auth.uid};
      var deferred = $q.defer();
      $http.post(uploadFileEndpoint, postObj).success(function(data, status, headers){
        console.log('upload call returned successfully with:', data);
        deferred.resolve(data);
      }).error(function(data, status, headers){
        console.error('error with upload call:', data);
        deferred.reject(data);
      });
      return deferred.promise;

    },
		downloadFileFromS3: function(argAppName, argFileKey){
			console.log('[editorService]downloadFileFromS3 called to download:' + argFileKey+ ' from ' + argAppName);
			var deferredDownload = $q.defer();
      console.log('downloadFileFromS3 filekey:', argFileKey);
			var uploadParams = {Bucket:'pyro-'+argAppName, Key:argFileKey};
      console.log('[editorService] downloadParams:', uploadParams);
      configS3().then(function(){
        s3.getObject(uploadParams, function(err, data){
          if(!err){
            console.log('[editorService] object retreived successfully:', data.Body.toString());
            // Resolve string of file contents
            deferredDownload.resolve(data.Body.toString());
            // [TODO] Save content to firebase appFiles/fileContent/$appName/$fileName
          } else {
            console.error('[editorService] Error downloading file:', err, err.stack);
            deferredDownload.reject(err);
          }
        });
      }, function(err){
        deferredDownload.reject(err);
      })

      return deferredDownload.promise;
		},
    // /downloadFileFromS3
    getFolderStructure:function(argAppName){
      console.log('getFolderStucture called:');
      var deferred = $q.defer();
      var params = {Bucket:"pyro-" + argAppName};
      // configS3().then(function(){
      //   s3.listObjects(params, function(err, data){
      //     if(!err){
      //       console.log('Objects loaded from S3:', data);
      //       arrayOfFileObjectsToStructure(data.Contents).then(function(returnedStructure) {
      //
      //         deferred.resolve(returnedStructure);
      //
      //       })
      //     } else {
      //       console.error('Error getting objects from S3');
      //       deferred.reject(err);
      //     }
      //   });
      // });
      // function arrayOfFileObjectsToStructure(argArray){
      //   var deferred = $q.defer();
      //
      //   var modifiedArray = _.each(argArray, function(fileObject){
      //     if(fileObject.hasOwnProperty('Key')){
      //       var itemInfo = {
      //         path:,
      //         name:
      //       }
      //       if(keyIsDirectory(fileObject.Key)){
      //
      //       } else {
      //
      //       }
      //     } else {
      //       var err = {message:'Object does not have property "Key"', error:"INVALID_S3_OBJECT"};
      //       console.error(, fileObject);
      //       deferred.reject({});
      //     }
      //   })
      //   deferred.resolve();
      //
      //   return deferred.promise;
      //
      // }
      //
      // function keyIsDirectory(key){
      //   if(key && typeof key == 'string'){
      //     console.warn('key split:', key.split("/"));
      //     if(key.split("/").length > 1){
      //       return true
      //     } else {
      //       return false
      //     }
      //   } else {
      //     console.error('[keyIsDirectory] Invalid key');
      //     return false
      //   }
      // }
      // TODO Make this an angularfire object with path strinify/unstrinify attributes
      pyroMaster.$loadObject(folderStuctureLocation, argAppName).then(function(returnedObject){
        if(returnedObject){
          console.log('[editorService.getFolderStructure]:', returnedObject);
          deferred.resolve(returnedObject);
        } else {
          console.error('Error loading file stucture from firebase.');
          deferred.reject({message:'Error loading file structure'});
        }
      });
      return deferred.promise;
    },
    addNewFolder:function(argFolderName, argFolderPath, argAppName){
      console.log('addNewFolder called:');
      var deferred = $q.defer();
      const actualFolderPath = "fs/pyro-"+argAppName +"/" + argFolderPath;
      var pathArray = argFolderPath.split("/");
      var appStructurePathArray = [folderStuctureLocation, argAppName];
      //Add folder to firebase location
      pyroMaster.fbRef(appStructurePathArray).on('value', function(appStructureSnap){
        var appStructure = appStructureSnap.val();
        if(appStructure){
          console.log('App structure found for ' + argAppName);
          var newFolderPathArray = appStructurePathArray.concat(pathArray);
          // New Folder ref
          // [TODO] Enforce with with a rule as well
          pyroMaster.fbRef(newFolderPathArray).on('value', function(newFolderSnap){
            if(!newFolderSnap.val()){
              var folderObj = {path:actualFolderPath, type:'folder'};
              console.log('setting new folderObj:', folderObj);
              newFolderSnap.ref().set(folderObj, function(err){
                if(!err){
                  console.log('New folder created successfully');
                  deferred.resolve();
                } else {
                  deferred.reject({message:'Error creating folder', error:err});
                }
              });
            } else {
              deferred.reject({message:'A Folder with that name already exists'});
            }
          });
        } else {
          console.error('App structure not found for ' + argAppName);
          deferred.reject({message:'App structure does not exist'})
        }
      }, function(err){
        console.error('Error loading file stucture from firebase.');
        deferred.reject({message:'Error loading file structure', error:err});
      });
      return deferred.promise;

    },
    createNewFile:function(){
      console.log('createNewFile called:');
      var deferred = $q.defer();

      return deferred.promise;
    }
	}
  var creds = null;
  var s3 = null;
  // Configure S3 credentials using key loaded from FB
  function configS3() {
    var deferred = $q.defer();
    if(!creds) {
      console.log('Credentials do not currently exist, retrieving from firebase');
      var auth =  pyroMaster.mainRef.getAuth();
      if(auth) {
        pyroMaster.mainRef.child(dataLocation).child(credsLocation).on('value', function(credsSnap){
          if(credsSnap.val()){
            creds = credsSnap.val();
            console.log('S3 creds loaded from firebase successfully:', creds);
            AWS.config.update(creds);
            s3 = new AWS.S3();
            console.log('AWS config set');
            deferred.resolve(s3);
          } else {
            console.error('s3Creds not found on firebase');
            deferred.reject({message:'Credentials not found'});
          }
        }, function(err){
          console.error('Error loading s3Creds from firebase:', err);
          deferred.reject(err);
        });
      } else {
        deferred.reject({message:'Login required'});
      }
    } else {
      deferred.resolve(creds);
    }
    return deferred.promise;
  }
  function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
  }
  //[TODO] These functions should be prototypes of an angularfire object
  function stringifyPath(argFile, argAppName) {
    // Remove fs from path
    console.log('[stringifyPath] called with:', argFile);
    var strPath = argFile.path.replace('fs/', '');
    console.log('[stringifyPath] fs removed:', strPath);
    // remove app name
    strPath = strPath.replace("pyro-"+ argAppName +'/', '');
    strPath = strPath.replace('.', ':');
    console.log('[stringifyPath] remeved app name:', strPath);
    // Break it down by '/'
    var finalRefArray = strPath.split('/');
    console.warn("[stringifyPath] FinalRefArray: ",finalRefArray);
    finalRefArray = finalRefArray.join('-');
    console.log('[stringifyPath] finalRefStr:', finalRefArray);
    return finalRefArray;
  }
  function unstringifyPath(argFile){
    // Remove fs from path
    console.log('[unstringifyPath] called with:', argFile);
    var actualFilePath = argFile.path.replace('fs/pyro-'+$scope.pyroInstance.name+'/', '');
    console.log('[unstringifyPath] removed app name and fs:', actualFilePath);
    actualFilePath = replaceAll('/', '-', actualFilePath);
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
  function isAuthenticated(){
    var auth = pyroMaster.getAuth();
    if(auth && auth.hasOwnProperty('uid')){
      return true
    } else {
      return false
    }
  }
  // Replace all occurences of a string within another string
  // function replaceAll(find, replace, str) {
  //   return str.replace(new RegExp(find, 'g'), replace);
  // }
})
