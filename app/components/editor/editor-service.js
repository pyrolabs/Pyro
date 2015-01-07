angular.module('editor.service', ['pyro.service', 'pyroApp.config'])
.factory('editorService',function($q, $http, pyroMaster, SERVERURL){
  const folderStuctureLocation = 'appFiles';
  const dataLocation = 'alphaData';
  const credsLocation = 's3Creds';
  const uploadFileEndpoint = SERVERURL + "/app/upload"
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
		downloadFileFromS3: function(argAppName, argFilePath){
			console.log('[editorService]downloadFileFromS3 called to download:' + argFilePath + ' from ' + argAppName);
			var deferredDownload = $q.defer();
      var fileKey = argFilePath.replace("fs/pyro-"+ argAppName + "/", "");
      console.log('downloadFileFromS3 filekey:', fileKey);
			var uploadParams = {Bucket:'pyro-'+argAppName, Key:fileKey};
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
		}, // /downloadFileFromS3
    getFolderStructure:function(argAppName){
      console.log('getFolderStucture called:');
      var deferred = $q.defer();
      var params = {Bucket:"pyro-" + argAppName};
      configS3().then(function(){
        s3.listObjects(params, function(err, data){
          if(!err){
            console.log('Objects loaded from S3:', data);
            var filesByLevel = _.groupBy(data.Contents, function(file){
              return file.Key.split("/").length;
            });
            console.warn('TreeStructure:', filesByLevel);
            deferred.resolve(filesByLevel);

          } else {
            console.error('Error getting objects from S3');
            deferred.reject(err);
          }
        });
      });
  //     pyroMaster.$loadObject(folderStuctureLocation, argAppName).then(function(returnedObject){
  //       if(returnedObject){
  //         console.log('[editorService.getFolderStructure]:', returnedObject);
  //         deferred.resolve(returnedObject);
  //       } else {
  //         console.error('Error loading file stucture from firebase.');
  //         deferred.reject({message:'Error loading file structure'});
  //       }
  //     });
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
})
