angular.module('pyro.service', ['firebase'])
// [TODO] Make this extensions of angularFire factories
// PyroArray Adds pyro to angular fire lists
.factory('PyroArrayFactory',function($FirebaseArray, pyro){
	return function(snap){
		return $FirebaseArray.$extendFactory({
			// Overide $createObject behavior to return pyro object
			// $$added:function(snap){
			// 	// [TODO] Add check for apps that are managed
			// 	if(snap.val().hasOwnProperty('dbUrl')){
			// 		var loadedObj = snap.val();
			// 		loadedObj.url = snap.val().dbUrl;

			// 		return loadedObj;
			// 	} else {
			// 		return snap.val();
			// 	}
			// },
			$$updated:function(snap){
				// var instance =this.$getRecord(snap.key())
				// return snap.getUserCount()
			}
		});
	}
})
.factory('PyroObjectFactory',function($FirebaseObject, pyro){
	return function(snap){
		return $FirebaseObject.$extendFactory({
			// Overide $createObject behavior to return pyro object
			$$added:function(snap){
				// [TODO] Add check for apps that are managed
				if(snap.val().hasOwnProperty('dbUrl')){
					var loadedObj = snap.val();
					loadedObj.url = snap.val().dbUrl;
					return pyro(loadedObj);
				} else {
					return snap.val();
				}
			}
		});
	}
})
.factory('PyroArray', function($firebase, PyroArrayFactory, pyroMaster){
	return function(list){
		// query for objects created by user
		var auth = pyroMaster.getAuth();
		console.log('pyroMaster:', pyroMaster);
		var query = pyroMaster.mainRef.child(list).orderByChild('author').equalTo(auth.uid);
		return $firebase(query, {arrayFactory:PyroArrayFactory()}).$asArray();
	}
})
.factory('PyroObject', function($firebase, PyroObjectFactory, pyroMaster){
	return function(list){
		// query for objects created by user
		var auth = pyroMaster.getAuth();
		console.log('pyroMaster:', pyroMaster);
		var query = pyroMaster.mainRef.child(list).orderByChild('author').equalTo(auth.uid);
		return $firebase(query, {arrayFactory:PyroObjectFactory()}).$asObject();
	}
})
.factory('pyro', ['$q', function($q ){
	return function (argPyroObj){
		var auth = null;
		var account = null;
		var pyro = new Pyro(argPyroObj);
			pyro.$signup =  function(argSignupData) {
				var deferred = $q.defer();
				console.log('[PyroService] $signup called', argSignupData);
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
				console.warn('[PyroService] $getUser called');
				var deferredLogin = $q.defer();
				pyro.login(argLoginData, function(returnedAccount){
					if(returnedAccount){
							account = returnedAccount;
							deferredLogin.resolve(account);
						} else {
							console.log('got null for returnedAccount:', returnedAccount);
							deferredLogin.reject();
						}
				});
				return deferredLogin.promise;
			};
			pyro.$getUser = function() {
				var deferred = $q.defer();
				console.warn('[PyroService] $getUser called');
				if(account != null) {
					deferred.resolve(account);
				}
				else {
					pyro.getUser(function(returnedAccount){
						if(returnedAccount){
							account = returnedAccount;
							deferred.resolve(account);
						} else {
							console.log('got null for returnedAccount:', returnedAccount);
							deferred.reject();
						}
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
				if(auth != null){
					deferred.resolve(auth);
				} else {
					deferred.reject();
				}
				return deferred.promise;
			};
			pyro.$getUserCount =  function(){
				var deferred = $q.defer();
				pyro.getUserCount(function(userCount){
					deferred.resolve(userCount);
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
				var endpointLocation = pyroServerUrl + 'api/generate';
				var postObj = {name: argInstanceName, uid:auth.uid};
				$http.post(endpointLocation, postObj).success(function(data, status, headers){
					console.log('[$generatePyro] Call to :' + endpointLocation + ' returned:', data, status);
					var instanceData = data;
					delete instanceData.status;
					console.log('Setting new app data to Firebase:', instanceData);
					newInstanceRef.set(instanceObj, function(err){
						if(!err) {
							// resolve with newInstanceRef data
							console.log('new app generated successfully');
							deferred.resolve(newInstanceRef);
						} else {
							console.error('Error setting new pyro:', err);
							deferred.reject(err);
						}
					}); //---newInstanceRef.set()
				}).error(function(data, status, headers){
					var errorObj = {data:data, status:status, headers:headers}
					console.error('error creating new instance:', errorObj);
					deferred.reject(errorObj);
				});
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
	pyro.$createApp = function(argAppName){
		console.log('$createApp called');
		var deferred = Q.defer();
		var endpointLocation = pyroServerUrl + 'api/app/new';
		var postObj = {name: argAppName, uid:auth.uid};
		var instanceRef = pyroBase.child('instances').child(argAppName);
		$http.post(endpointLocation, postObj).success(function(data, status, headers){
			console.log('[$manageInstance] Call to :' + endpointLocation + ' returned:', data, status);
			var instanceData = {name:argAppName, dbUrl:data.instance, author:auth.uid, type: 'manage'};
			console.log('Setting new app data to Firebase:', instanceData);
			instanceRef.set(instanceData, function(err){
				if(!err) {
					// resolve with instanceRef data
					console.log('new app generated successfully');
					deferred.resolve(instanceData);
				} else {
					console.error('Error setting new pyro:', err);
					deferred.reject(err);
				}
			}); //---instanceRef.set()
		}).error(function(data, status, headers){
			var errorObj = {data:data, status:status, headers:headers}
			console.error('error getting instance:', errorObj);
			deferred.reject(errorObj);
		});
		return deferred.promise;
	};
	pyro.$manageInstance = function(argInstanceData) {
		var deferredCreate = $q.defer();
		// [TODO] Do this correctly with the library
		var endpointLocation = pyroServerUrl + 'api/fb/instance/get';
		var postObj = {name: argInstanceData.name, uid:auth.uid};
		var newInstanceRef = pyroBase.child('instances').child(argInstanceData.name);
		newInstanceRef.once('value', function(instanceSnap){
			if(!instanceSnap.val()){
				$http.post(endpointLocation, postObj).success(function(data, status, headers){
					console.log('[$manageInstance] Call to :' + endpointLocation + ' returned:', data, status);
					var instanceData = {name:argInstanceData.name, dbUrl:data.instance, author:auth.uid, type: 'manage'};
					console.log('Setting new app data to Firebase:', instanceData);
					newInstanceRef.set(instanceData, function(err){
						if(!err) {
							// resolve with newInstanceRef data
							console.log('new app generated successfully');
							deferredCreate.resolve(instanceData);
						} else {
							console.error('Error setting new pyro:', err);
							deferredCreate.reject(err);
						}
					}); //---newInstanceRef.set()
				}).error(function(data, status, headers){
					var errorObj = {data:data, status:status, headers:headers}
					console.error('error getting instance:', errorObj);
					deferredCreate.reject(errorObj);
				});
			} else {
				console.error('There is already a pyro app with that name');
				deferredCreate.reject({message:'There is already a pyro app with that name'});
			}
		});

					// pyro.createInstance(argObject, function(newObjectRef){
					// 	console.error('[pyroService] instance creation successful:', newObjectRef);
					// 	deferredCreate.resolve(newObjectRef);
					// }, function(err){
					// 	console.error('[pyroService] error creating instance');

					// 	deferredCreate.reject(argObject);
					// });
				return deferredCreate.promise;
			};
	pyro.$deleteInstance = function(){
		console.log('deleteInstance called with:', argInstanceName);
		var deferred = $q.defer();
		var postObj = {name: argInstanceName};
		$http.post(pyroServerUrl + 'api/delete', postObj).success(function(data, status, headers){
			console.log('deleteSuccessful:', data);
			deferred.resolve(data);
		}).error(function(data, status, headers){
			var errorObj = {data:data, status:status, headers:headers}
			console.error('error creating new instance:', errorObj);
			deferred.reject(errorObj);
		});
		return deferred.promise;
	}
	pyro.$createFbAccount = function(argSignupData){
		console.log('[PyroMaster]createFbAccount called:', argSignupData);
		var deferred = $q.defer();
		// [TODO] look into if password should just be uid to be able to get the account later
		if(argSignupData.hasOwnProperty('email') && argSignupData.hasOwnProperty('password')) {
			var endpointUrl = pyroServerUrl + 'api/fb/account/new';
			console.log('[pyroService PyroMaster.$createFbAccount] Calling to server endpoint:', endpointUrl);
			$http.post(endpointUrl, argSignupData).success(function(data, status, headers){
				console.warn('[pyroService PyroMaster.$createFbAccount]'+ endpointUrl + ' call returned data:', data, ' status:', status, ' headers:' ,headers);
				if(status && status == 200){
					console.log('account creation successful:', data);
					if(data.hasOwnProperty('account')){
						var fbAccountData = {token: data.account.adminToken, email:argSignupData.email, createdAt: Firebase.ServerValue.TIMESTAMP};
						var auth = self.pyroRef.getAuth();
						self.pyroRef.child('fbData').child(auth.uid).setWithPriority(fbAccountData, argSignupData.email, function(fbInfoSnap){
							deferred.resolve(data.account);
						});
					} else {
						console.error('[pyroService PyroMaster.$createFbAccount] response does not contain account variable');
						deferred.reject({message:'Server Error. Please Contact Us'});
					}
				} else if(status && status == 401) {
					console.warn('status of $httppost is good:', status);
					deferred.reject({status:status, message:body.message})
				} else if(data.hasOwnProperty('status')) {
					console.warn('has own property status, but not status on $httpPost?', data.status);
					deferred.reject({error:data.error, message:body.message});
				} else {
					console.error('account load not successful:', status);
					deferred.reject(data);
				}

			}).error(function(data, status, headers){
				console.error('error creating new fb account:',data);
				deferred.reject(data);
			});
		} else {
			console.error('email and password nessesary for creating a firebase account');
			deferred.reject();
		}
		return deferred.promise;
	}
	pyro.$getFbAccount = function(argSignupData){
		console.log('[PyroMaster] getFbAccount called:', argSignupData);
		var self = this;
		var deferred = $q.defer();
		// [TODO] look into if password should just be uid to be able to get the account later
		if(argSignupData.hasOwnProperty('email') && argSignupData.hasOwnProperty('password')) {
			$http.post(pyroServerUrl + 'api/fb/account/get', argSignupData).success(function(data, status, headers){
				console.log('[pyroService pyroMaster.$getFbAccount] api/fb/acount/get returned:', data, status);
				if(status && status == 200){
					console.log('account load successful:', data, status);
					var fbAccountData = {token: data.account.adminToken, email:argSignupData.email, createdAt: Firebase.ServerValue.TIMESTAMP};
					var auth = self.pyroRef.getAuth();
					self.pyroRef.child('fbData').child(auth.uid).setWithPriority(fbAccountData, argSignupData.email, function(err){
						if(!err){
							deferred.resolve(fbAccountData);

						} else {
							console.error('[pyro service PyroMaster] error setting fbData:', err);
							deferred.reject(err);
						}
					});
				} else if(status && status == 401) {
					console.warn('status of $httppost is good:', status, body);
					deferred.reject({status:status, message:body.message})
				} else if(data.hasOwnProperty('status')) {
					console.warn('has own property status, but not status on $httpPost?', data.status);
					deferred.reject({status:data.status, message:body.message});
				} else {
					console.error('account load not successful:', status);
					deferred.reject(data);
				}
			}).error(function(data, status, headers){
				console.error('error getting fb account:',data, status, headers);
				deferred.reject(data);
			});
		} else {
			console.error('email and password nessesary for getting a firebase account');
			deferred.reject();
		}
		return deferred.promise;
	}
	return pyro;
}])