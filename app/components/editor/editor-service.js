// <<<<<<< Updated upstream
angular.module('editor.service', ['pyro.service'])
.factory('editorService',function($q, $http, pyroMaster){
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
      var endpointLocation = "https://pyro-server.herokuapp.com/api/app/upload";
      var auth = pyroMaster.getAuth();
      if(!auth) {
        console.error('Not logged in');
        deferred.reject({message:'Not logged in'});
      }
      argFilePath = argFilePath.replace('fs', '');

      var postObj = {name:argAppName, filePath:argFilePath, uid:auth.uid};
      var deferred = $q.defer();
      $http.post(endpointLocation, postObj).success(function(data, status, headers){
        console.log('post to /app/upload returned successfully with:', data);
        deferred.resolve(data);
      }).error(function(data, status, headers){
        console.error('error posting to /app/upload:', data);
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
      console.log('getFolderStucture called:')
      var deferred = $q.defer();
      // var params = {Bucket:"pyro-" + argAppName};
      // s3.listObjects(params, function(err, data){
      //   if(!err){
      //     console.log('Objects loaded from S3:', data);
      //     deferred.resolve(data);
      //   } else {
      //     console.error('Error getting objects from S3');
      //     deferred.reject(err);
      //   }
      // });
    pyroMaster.$loadObject('appFiles', argAppName).then(function(returnedObject){
      if(returnedObject){
        console.log('[editorService.getFolderStructure]:', returnedObject);
        deferred.resolve(returnedObject);

      } else {
        console.error('Error loading file stucture from firebase.');
        deferred.reject({message:'Error loading file structure'});
      }
     });
      return deferred.promise;
    }
	}
  var creds = null;
  var s3 = null;
  function configS3() {
    var deferred = $q.defer();
    const dataLocation = 'alphaData';
    const credsLocation = 's3Creds';
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