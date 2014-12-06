angular.module('editor.service', [])
.factory('editorService',function($q){
	return{
		getFile:function(){
			//provide correct version of file
		},
		downloadFileFromS3: function(argAppName, argFilePath){
			console.log('[editorService]downloadFileFromS3 called to download:' + argFilePath + ' from ' + argAppName);
			var deferredDownload = $q.defer();
      var s3 = new AWS.S3();
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
		} // /downloadFileFromS3
	}

})