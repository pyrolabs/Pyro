angular.module('pyro.service', [])
// [TODO] Make this extensions of angularFire factories
.factory('pyro', ['$rootScope', 'FBURL','pyroMaker',  function($rootScope, FBURL, pyroMaker) {
	return pyroMaker(FBURL);
}])
.factory('pyroMaster', ['pyroMaker', '$http', '$q', function(pyroMaker, $http, $q) {
	var pyro = pyroMaker('http://pyro.firebaseio.com');
	var pyroBase = new Firebase('http://pyro.firebaseio.com');
	var pyroServerUrl = "https://pyro-server.herokuapp.com/"
	// var pyroServerUrl = "localhost:4000/"
	var auth = pyro.getAuth();
	pyro.generatePyro = function(argInstanceName){
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
	pyro.deleteInstance = function(){
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
.factory('pyroMaker', ['$q', function($q){
	return function (argPyroUrl){
		var auth = null;
		var account = null;
		var pyro = new Pyro({url:argPyroUrl});
		return {
			library: pyro,
			signup: function(argSignupData) {
				var deferred = $q.defer();
				pyro.userSignup(argSignupData, function(userAccount) {
		      console.log('signup + login successful:', userAccount);
		      deferred.resolve(userAccount)
		    }, function(err) {
		      console.warn('pyroSignup returned:', err);
		      deferred.reject(err)
		    });
		    return deferred.promise;
			},
			login: function(argLoginData) {
				var deferredLogin = $q.defer();
				pyro.login(argLoginData, function(returnedAccount){
					deferredLogin.resolve(returnedAccount);
				}, function(err){
					deferredLogin.reject(err);
				});
				return deferredLogin.promise;
			},
			getUser:function() {
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
			},
			passwordLogin: function(argLoginData) {
				console.log('passwordLogin:', arguments);
				var deferredLogin = $q.defer();
				pyro.login(argLoginData, function(returnedAccount){
					deferredLogin.resolve(returnedAccount);
				}, function(err){
					deferredLogin.reject(err);
				});
				return deferredLogin.promise;
			},
			logout: function() {
				var deferred = $q.defer();
				auth = null;
				account = null;
				pyro.logout(function(){
					deferred.resolve();
				});
				return deferred.promise;
			},
			promiseAuth: function(){
				var deferred = $q.defer();
				var auth = pyro.getAuth();
				if(auth){
					deferred.resolve(auth);
				} else {
					deferred.reject();
				}
				return deferred.promise;
			},
			getAuth: function(){
				return pyro.getAuth();
			},
			getUser: function(){
				var deferred = $q.defer();
				pyro.getUser(function(userAccount){
					deferred.resolve(userAccount);
				});
				return deferred.promise;
			},
			getListByAuthor: function(argListName) {
				var deferredLoad = $q.defer();
				pyro.getListByAuthor(argListName, function(returnedList){
					deferredLoad.resolve(returnedList);
				});
				return deferredLoad.promise;
			},
			createObject:function(argListName, argObject) {
				var deferredCreate = $q.defer();
				// [TODO] Do this correctly with the library
					pyro.createObject(argListName, argObject, function(newObject){
						deferredCreate.resolve(newObject);
					});
				return deferredCreate.promise;
			},
			createInstance:function(argObject) {
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
			},
			loadObject:function(argListName, argObjectId){
				var deferredLoad = $q.defer();
				pyro.loadObject(argListName, argObjectId, function(loadedObject){
					deferredLoad.resolve(loadedObject);
				});
				return deferredLoad.promise;
			},
			deleteObject:function(argListName, argObjectId){
				pyro.deleteObject(argListName, argObjectId);
				console.log(argObjectId + ' was removed from the ' + argListName + ' list');
			},
			getObjectCount:function(argListName) {
				var deferred = $q.defer();
				pyro.getObjectCount(argListName,function(count){
					deferred.resolve(count);
				});
				return deferred.promise;
			}
		}
	}
}])