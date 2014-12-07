angular.module('editor.service', [])
.factory('editorService',function($q){
      var s3 = new AWS.S3();
	return{
		saveFile:function(argBucketName, argFilePath, argFileContents){
			console.log('[editorService] saveFile called', arguments);
      var deferred = $q.defer();
      var saveParams = {Bucket:argBucketName, Key:argFilePath,  Body: new Buffer(argFileContents)};
      s3.putObject(saveParams, function(err, data){
        if(!err){
          console.log('file saved successfully');
          deferred.resolve(data);
        } else {
          console.log('error saving file:', err);
          deferred.reject(err);
        }
      });
      return deferred.promise;
		},
		downloadFileFromS3: function(argAppName, argFilePath){
			console.log('[editorService]downloadFileFromS3 called to download:' + argFilePath + ' from ' + argAppName);
			var deferredDownload = $q.defer();
			var uploadParams = {Bucket:'pyro-'+argAppName, Key:argFilePath};
      console.log('uploadParams:', uploadParams);
      s3.getObject(uploadParams, function(err, data){
        if(!err){
          console.log('object retreived successfully:', data.Body.toString());
          // Resolve string of file contents
          deferredDownload.resolve(data.Body.toString());
          // [TODO] Save content to firebase appFiles/fileContent/$appName/$fileName
        } else {
          console.error('[editorService] Error downloading file:', err, err.stack);
          deferredDownload.reject(err);
        }
      });
      return deferredDownload.promise;
		}, // /downloadFileFromS3
    getFolderStucture:function(argAppName){
      console.log('getFolderStucture called:')
      var deferred = $q.defer();
      var params = {Bucket:bucketName};
      s3.listObject(params, function(err, data){
        if(!err){
          console.log('Objects loaded from S3:', data);
          deferred.resolve(data);
        } else {
          console.error('Error getting objects from S3');
          deferred.reject(err);
        }
      });
      return deferred.promise;
    }
	}

})