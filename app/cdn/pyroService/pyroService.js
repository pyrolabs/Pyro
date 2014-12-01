angular.module('pyro.service', ['firebase'])
// [TODO] Make this extensions of angularFire factories
// PyroArray Adds pyro to angular fire lists
.factory('PyroFactory',function($FirebaseArray){
	return function(snap){
		return $FirebaseArray.$extendFactory({
			// Overide $createObject behavior to return pyro object
			$$added:function(snap){
				// [TODO] Add check for apps that are managed
				if(snap.val().hasOwnProperty('dbUrl')){
					var loadedObj = snap.val();
					loadedObj.url = snap.val().dbUrl;
					return new Pyro(loadedObj);
				} else {
					return snap.val();
				}
			}
		});
	}
})
.factory('PyroArray', function($firebase, PyroFactory, pyroMaster){
	return function(list){
		// query for objects created by user
		var auth = pyroMaster.getAuth();
		console.log('pyroMaster:', pyroMaster);
		var query = pyroMaster.mainRef.child(list).orderByChild('author').equalTo(auth.uid);
		return $firebase(query, {arrayFactory:PyroFactory()}).$asArray();
	}
})

.factory('pyro', ['$q', function($q){
	return function (argPyroObj){
		var auth = null;
		var account = null;
		var pyro = new Pyro(argPyroObj);
			pyro.$signup =  function(argSignupData) {
				var deferred = $q.defer();
				pyro.userSignup(argSignupData, function(userAccount) {
		      console.log('signup + login successful:', userAccount);
		      deferred.resolve(userAccount);
		    }, function(err) {
		      console.warn('pyroSignup returned:', err);
		      deferred.reject(err)
		    });
		    return deferred.promise;
			};
			pyro.$login =  function(argLoginData) {
				var deferredLogin = $q.defer();
				pyro.login(argLoginData, function(returnedAccount){
					deferredLogin.resolve(returnedAccount);
				}, function(err){
					deferredLogin.reject(err);
				});
				return deferredLogin.promise;
			};
			pyro.$getUser = function() {
				var deferred = $q.defer();
				if(account != null) {
					deferred.resolve(account);
				}
				else {
					pyro.getUser(function(returnedAccount){
						account = returnedAcount;
						deferred.resolve(returnedAccount);
					});
				}
				return deferred.promise;
			};
			pyro.$logout =  function() {
				var deferred = $q.defer();
				auth = null;
				account = null;
				pyro.logout(function(){
					deferred.resolve();
				});
				return deferred.promise;
			};
			pyro.$auth =  function(){
				var deferred = $q.defer();
				var auth = pyro.getAuth();
				if(auth){
					deferred.resolve(auth);
				} else {
					deferred.reject();
				}
				return deferred.promise;
			};
			pyro.$getUser =  function(){
				var deferred = $q.defer();
				pyro.getUser(function(userAccount){
					deferred.resolve(userAccount);
				});
				return deferred.promise;
			};
			pyro.$getListByAuthor =  function(argListName) {
				var deferredLoad = $q.defer();
				pyro.getListByAuthor(argListName, function(returnedList){
					deferredLoad.resolve(returnedList);
				});
				return deferredLoad.promise;
			};
			pyro.$createObject = function(argListName, argObject) {
				var deferredCreate = $q.defer();
				// [TODO] Do this correctly with the library
					pyro.createObject(argListName, argObject, function(newObject){
						deferredCreate.resolve(newObject);
					});
				return deferredCreate.promise;
			};
			pyro.$createInstance = function(argObject) {
				var deferredCreate = $q.defer();
				// [TODO] Do this correctly with the library
					pyro.createInstance(argObject, function(newObjectRef){
						console.error('[pyroService] instance creation successful:', newObjectRef);
						deferredCreate.resolve(newObjectRef);
					}, function(err){
						console.error('[pyroService] error creating instance');

						deferredCreate.reject(argObject);
					});
				return deferredCreate.promise;
			};
			pyro.$loadObject = function(argListName, argObjectId){
				var deferredLoad = $q.defer();
				pyro.loadObject(argListName, argObjectId, function(loadedObject){
					deferredLoad.resolve(loadedObject);
				});
				return deferredLoad.promise;
			};
			pyro.$deleteObject = function(argListName, argObjectId){
				pyro.deleteObject(argListName, argObjectId);
				console.log(argObjectId + ' was removed from the ' + argListName + ' list');
			};
			pyro.$getObjectCount = function(argListName) {
				var deferred = $q.defer();
				pyro.getObjectCount(argListName,function(count){
					deferred.resolve(count);
				});
				return deferred.promise;
			};
			return pyro;
	}
}])
.factory('pyroMaster', ['pyro', '$http', '$q', function(pyro, $http, $q) {
	var pyro = pyro({url:'http://pyro.firebaseio.com'});
	var pyroBase = new Firebase('http://pyro.firebaseio.com');
	var pyroServerUrl = "https://pyro-server.herokuapp.com/";
	// var pyroServerUrl = "localhost:4000/"
	var auth = pyro.getAuth();
	pyro.$generatePyro = function(argInstanceName){
		//request server for new instance. Create
		console.log('generatePyro called with:', argInstanceName);
		var deferred = $q.defer();
		if(argInstanceName) {
			//Instance name exists
			var newInstanceRef = pyroBase.child('instances').child(argInstanceName);
			if(auth) {
				//Auth exists
				var dbName = "pyro-"+ argInstanceName;
				var dbUrl = "https://"+dbName+".firebaseio.com"
				var instanceObj = {name: argInstanceName, author:auth.uid, dbName:dbName, createdAt:Firebase.ServerValue.TIMESTAMP, dbUrl:dbUrl};
				newInstanceRef.set(instanceObj, function(err){
					if(!err){
						var endpointLocation = pyroServerUrl + 'api/generate';
						var postObj = {name: argInstanceName, author:auth.uid};
						$http.post(endpointLocation, postObj).success(function(data, status, headers){
							console.log('postSuccessful:', data);
							if(data.hasOwnProperty('url')){
								newInstanceRef.update({appUrl:data.url});
							}
							// resolve with newInstanceRef data
							deferred.resolve(newInstanceRef);
						}).error(function(data, status, headers){
							var errorObj = {data:data, status:status, headers:headers}
							console.error('error creating new instance:', errorObj);
							deferred.reject(errorObj);
						});
					} else {
						console.error('Error setting new pyro:', err);
						deferred.reject(err);
					}
				}); //---newInstanceRef.set()
				
			} else {
				var errObj = {message:'You must be logged in to create an instance'};
				deferred.reject(errObj);
			}
		} else {
			var errObj = {message:'Please enter a valid app name'};
			deferred.reject(errObj);
		}
		return deferred.promise;
	}
	pyro.$deleteInstance = function(){
		console.log('deleteInstance called with:', argInstanceName);
		var deferred = $q.defer();
		var postObj = {name: argInstanceName};
		$http.post(pyroServerUrl + 'delete', postObj).success(function(data, status, headers){
			console.log('deleteSuccessful:', data);
			deferred.resolve(data);
		}).error(function(data, status, headers){
			var errorObj = {data:data, status:status, headers:headers}
			console.error('error creating new instance:', errorObj);
			deferred.reject(errorObj);
		});
		return deferred.promise;
	}
	return pyro;
}])