angular.module('editor.service', ['pyro.service', 'pyroApp.config', 'firebase'])
.factory('editorService',function($q, $http, pyroMaster, SERVERURL, $firebase){
  const folderStructureLocation = 'appFiles';
  const fileStorageLocation = 'appRam'
  const dataLocation = 'alphaData';
  const credsLocation = 's3Creds';
  const uploadFileEndpoint = SERVERURL + "app/upload"
  var firepad = null;
	return{
    // Save file to S3
		saveFile:function(argBucketName, argFilePath, argFileContents){
			console.log('[editorService] saveFile called', arguments);
      var deferred = $q.defer();
      var saveParams = {Bucket:argBucketName, Key:argFilePath,  Body: argFileContents};
      configS3().then(function(){
        s3.putObject(saveParams, function(err, data){
          if(!err){
            console.log('file saved successfully');
            deferred.resolve(data);
          } else {
            console.error('error saving file:', err);
            deferred.reject(err);
          }
        });
      });
      return deferred.promise;
		},
    saveContentsToS3:function(argAppName, argFilePath, argFileContent){
      var auth = pyroMaster.getAuth();
      if(!auth) {
        console.error('Not logged in');
        deferred.reject({message:'Not logged in'});
      }
      var deferred = $q.defer();
      //Post to uploadFileEndpoint on server (server saves contents to s3)
      var postObj = {name:argAppName, filePath:argFilePath, uid:auth.uid, content: argFileContent};
      console.log('Posting to server at ' + uploadFileEndpoint, postObj);
      $http.post(uploadFileEndpoint, postObj).success(function(data, status, headers){
        console.log('upload call returned successfully with:', data);
        deferred.resolve(data);
      }, function(data, status, headers){
        console.error('error with upload call:', data);
        deferred.reject(data);
      });
      return deferred.promise;
    },
    //Open file using ace editor and firepad
    openWithFirepad:function(argAppName, argFileObject, argEditor){
      var deferred = $q.defer();
      var self = this;
      var auth = pyroMaster.getAuth();
      var fileObject = argFileObject;
      fileObject.pathStr = stringifyPath(fileObject, argAppName);
      // Incase of old file structure
      fileObject.path = fileObject.path.replace("fs/");
      // Remove App name
      fileObject.path = fileObject.path.replace("pyro-"+ argAppName +"/", "");
      if(auth){
        //User is authenticated
        // Reference to file
        var firepadRef = pyroMaster.mainRef.child(fileStorageLocation).child(argAppName).child(fileObject.pathStr);
        var fileDataObj = {path:argFileObject.path, name:argFileObject.name};
        if(fileDataObj.hasOwnProperty('filetype')){
          fileDataObj.filetype = argFileObject.filetype;
        }
        firepadRef.update(fileDataObj);
        //Check if firepad exists
        if(firepad){
          console.log('[initializeFirepad] firepad already exists');
          // Disconnect old firepad session
          firepad.dispose();
          // Empty out editor
          argEditor.getSession().setValue(null);
        }
        argEditor.getSession().setValue(null);
        // Setup new Firepad
        firepad = Firepad.fromACE(firepadRef, argEditor, {userId:auth.uid});
        //Set File mode in editor
        argEditor.getSession().setMode(getFileMode(fileObject));
        // Wait for firepad to be ready
        firepad.on('ready', function(){
          //Check for existing file contents at ref
          if(firepad.isHistoryEmpty()){
            // File history does not already exist
            console.log('[initializeFirepad] File does not already exist');
            self.downloadFileFromS3(argAppName, argFileObject.path).then(function(fileContentString){
              console.log('[initializeFirepad] File contents returned', fileContentString);
              firepad.setText(fileContentString);
              deferred.resolve(firepad);
            }, function(err){
              if(err.code="NoSuchKey"){
                console.log('[initializeFirepad] File does not currenlty exist on s3');
                // Hasn't been saved to S3 yet
                firepadRef.update({hasBeenUploaded:false});
                // Resolve with firepad with ref that has not yet been uploaded to s3
                deferred.resolve(firepad);
              }
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
          } else if(err.code="NoSuchKey"){
            console.warn('[editorService] File has not yet been saved to S3');
            deferredDownload.reject(err);
          } else {
            console.error('[editorService] Error downloading file:', err, err.stack);
            deferredDownload.reject(err);
          }
        });
      }, function(err){
        deferredDownload.reject(err);
      });
      return deferredDownload.promise;
		},
    // /downloadFileFromS3
    getFolderStructure:function(argAppName){
      console.log('getFolderStucture called:');
      var deferred = $q.defer();
      var params = {Bucket:"pyro-" + argAppName};
      // TODO Make this an angularfire object with path strinify/unstrinify attributes
      pyroMaster.$loadObject(folderStructureLocation, argAppName).then(function(returnedObject){
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
    bindFolderStructure:function(argAppName, argScope, argName){
    	var deferred = $q.defer();
      var structureRef = pyroMaster.mainRef.child(folderStructureLocation).child(argAppName);
    	var sync = $firebase(structureRef);
    	var syncObject = sync.$asObject();
    	syncObject.$bindTo(argScope, argName).then(function(unbind){
     	  console.log('structure was bound to scope under the name: ' + argName);
    		deferred.resolve();
    	});
    	return deferred.promise;
    },
    addNewItemToStructure:function(argItemType, argItemPath, argAppName){
      console.log('addNewFolder called:');
      var deferred = $q.defer();
      console.log('folderPath:', argItemPath);
      var strPath = stringifyPath(argItemPath, argAppName);
      var pathArray = strPath.split("_");
      var folderName = _.last(argItemPath.split("/"));
      console.log('strPath:', strPath);
      var appStructurePathArray = [folderStructureLocation, argAppName];
      //Add folder to firebase location
      pyroMaster.fbRef(appStructurePathArray).once('value', function(appStructureSnap){
        var appStructure = appStructureSnap.val();
        if(appStructure){
          console.log('App structure found for ' + argAppName);
          // New Folder ref
          var folderRefArray = [appStructurePathArray];
          _.each(pathArray, function(location){
            folderRefArray.push('children');
            folderRefArray.push(location);
          });
          // [TODO] Enforce with with a rule as well
          pyroMaster.fbRef(folderRefArray).once('value', function(newFolderSnap){
            if(!newFolderSnap.val()){
              var folderObj = {path:argItemPath, type:argItemType, name:folderName};
              console.log('setting new:', folderObj);
              newFolderSnap.ref().set(folderObj, function(err){
                if(!err){
                  console.log('New '+ argItemType +' created successfully');
                  deferred.resolve();
                } else {
                  deferred.reject({message:'Error creating ' + argItemType, error:err});
                }
              });
            } else {
              deferred.reject({message:'A '+argItemType+' with that name already exists'});
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
    // No longer needed for newly generated apps
    if(argFile.hasOwnProperty('path')){
      var strPath = argFile.path.replace('fs/', '');
    } else {
      var strPath = argFile;
    }
    console.log('[stringifyPath] fs removed:', strPath);
    // remove app name
    strPath = strPath.replace("pyro-"+ argAppName +'/', '');
    strPath = strPath.replace(".", ':');
    console.log('[stringifyPath] remeved app name:', strPath);
    // Break it down by '/'
    var finalRefArray = strPath.split('/');
    console.warn("[stringifyPath] FinalRefArray: ",finalRefArray);
    finalRefArray = finalRefArray.join('_');
    console.log('[stringifyPath] finalRefStr:', finalRefArray);
    return finalRefArray;
  }
  // function unstringifyPath(argFile){
  //   // Remove fs from path
  //   console.log('[unstringifyPath] called with:', argFile);
  //   var actualFilePath = argFile.path.replace('fs/pyro-'+$scope.pyroInstance.name+'/', '');
  //   console.log('[unstringifyPath] removed app name and fs:', actualFilePath);
  //   actualFilePath = replaceAll('/', '-', actualFilePath);
  //   console.log('[unstringifyPath] removed backslashes:', actualFilePath);
  //   actualFilePath = actualFilePath.replace('.', ':');
  //   console.log('[unstringifyPath] replaced . :', actualFilePath);
  //   return actualFilePath;
  // }
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
  // Random letter/number generator
  function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ ){
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }
})
