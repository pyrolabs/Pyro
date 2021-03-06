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
.factory('fileRam', function($firebase, PyroObjectFactory, pyroMaster){
	return function(bucketName){
		// query for objects created by user
		var auth = pyroMaster.getAuth();
		console.log('pyroMaster:', pyroMaster);
		var ramRef = pyroMaster.mainRef.child('userRam').child(auth.uid).child(bucketName);
		return $firebase(ramRef, {arrayFactory:PyroObjectFactory()}).$asObject();
	}
})
.factory('pyro', ['$q', '$firebaseAuth','$firebase', function($q, $firebaseAuth, $firebase){
	return function (argPyroObj){
		var auth = null;
		var account = null;
		var pyro = new Pyro(argPyroObj);
		var sync = $firebase(pyro.mainRef);
		pyro.$auth = $firebaseAuth(pyro.mainRef);

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
			pyro.$bindObjectTo = function(argListName, argObjectId, argScope, argName){
				var deferred = $q.defer();
				var sync = $firebase(pyro.mainRef);
				var afObject = sync.$asObject();
				afObject.$bindTo(argScope, argName).then(function(unbind){
			 	console.log(argObjectId + ' was bound to scope under the name: ' + argName);
					deferred.resolve();
				});
				return deferred.promise;
			};
			pyro.$deleteObject = function(argListName, argObjectId){
				var deferred = $q.defer();
				pyro.deleteObject(argListName, argObjectId, function(){
					console.log(argObjectId + ' was removed from the ' + argListName + ' list');
					deferred.resolve();
				}, function(err){
					console.error('[$deleteObject] Error removing' + argObjectId + ' was removed from the ' + argListName + ' list');
					deferred.reject(err);
				});
				return deferred.promise;
			};
			// [TODO] Make this $getListCount and also create $getNestedListCount([], success, error)
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
.factory('pyroMaster', ['pyro', '$http', '$q', 'SERVERURL', '$analytics', function(pyro, $http, $q, SERVERURL, $analytics) {
	var pyroMaster = pyro({url:'http://pyro.firebaseio.com'});
	var pyroBase = new Firebase('http://pyro.firebaseio.com');
	var pyroServerUrl = SERVERURL;
	var auth = null;
	const dataLocation = 'alphaData';
	const eventInfoLocation = 'usage';
	pyroMaster.$generatePyro = function(argInstanceName){
		//request server for new instance. Create
		console.log('generatePyro called with:', argInstanceName);
		var deferred = $q.defer();
		if(argInstanceName) {
			//Instance name exists
			var newInstanceRef = pyroBase.child('instances').child(argInstanceName);
			auth = pyroMaster.mainRef.getAuth();
			if(auth) {
				//Auth exists
				var dbName = "pyro-"+ argInstanceName;
				var dbUrl = "https://"+dbName+".firebaseio.com"
				var appUrl = "pyro-"+ argInstanceName + ".s3-website-us-east-1.amazonaws.com"
				var instanceObj = {name: argInstanceName, bucketName:dbName, author:auth.uid, dbName:dbName, createdAt:Firebase.ServerValue.TIMESTAMP, dbUrl:dbUrl, url:dbUrl, appUrl:appUrl};
				const endpointLocation = pyroServerUrl + 'generate';
				var postObj = {name: argInstanceName, uid:auth.uid};
				$http.post(endpointLocation, postObj).success(function(data, status, headers){
					console.log('[$generatePyro] Call to :' + endpointLocation + ' returned:', data, status);
					var instanceData = data;
					delete instanceData.status;
					console.log('Setting new app data to Firebase:', instanceData);
					newInstanceRef.set(instanceObj, function(err){
						if(!err) {
							// resolve with newInstanceRef data
							console.log('Enabling email auth...');
							const emailEnableEndpoint = pyroServerUrl + "fb/config";
							var enableReqObj = {uid:auth.uid, name:argInstanceName};
							console.log('requesting to:', emailEnableEndpoint, ' with: ', enableReqObj);
							$http.post(emailEnableEndpoint, enableReqObj).success(function(data, status, headers){
								console.log('[pyroService.$generatePyro] new app generated successfully');
								deferred.resolve(newInstanceRef);
							}).error(function(data, status, headers){
								console.error('Error enabling email auth on new instance:', data);
								deferred.reject(data);
							});
						} else {
							console.error('[pyroService.$generatePyro] Error setting new pyro:', err);
							deferred.reject(err);
						}
					}); //---newInstanceRef.set()
				}).error(function(data, status, headers){
					var errorObj = {data:data, status:status, headers:headers}
					console.error('[pyroService.$generatePyro] error creating new instance:', errorObj);
					deferred.reject(data);
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
	pyroMaster.$createApp = function(argAppName){
		console.log('$createApp called');
		var deferred = $q.defer();
		const endpointLocation = pyroServerUrl + 'app/new';
		if(auth) {
			var postObj = {name: argAppName, uid:auth.uid};
			var instanceRef = pyroBase.child('instances').child(argAppName);
			$http.post(endpointLocation, postObj).success(function(data, status, headers){
				console.log('[$manageInstance] Call to :' + endpointLocation + ' returned:', data, status);
				var instanceData = {name:argAppName, dbUrl:data.instance, author:auth.uid, type: 'manage', bucketName:"pyro-"+argAppName, createdAt:Firebase.ServerValue.TIMESTAMP};
				console.log('Setting new app data to Firebase:', instanceData);
				instanceRef.set(instanceData, function(err){
					if(!err) {
						// resolve with instanceRef data
						console.log('new app generated successfully. Enabling email auth.');
						var emailEnableEndpoint = pyroServerUrl + "fb/config";
						var enableReqObj = {uid:auth.uid, name:argAppName};
						console.log('requesting to:', emailEnableEndpoint, ' with: ', enableReqObj);
						$http.post(emailEnableEndpoint, enableReqObj).success(function(data, status, headers){
							console.log('App generation and setup was sucessful');
							deferred.resolve(instanceData);
						}).error(function(data, status, headers){
							console.error('Error enabling email auth on new instance:', data);
							deferred.reject(data);
						});
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
		} else {
			deferred.reject({message:'You must be logged in to create an instance'});
		}
		return deferred.promise;
	};
	pyroMaster.$manageInstance = function(argInstanceData) {
		var deferredCreate = $q.defer();
		// [TODO] Do this correctly with the library
		const endpointLocation = pyroServerUrl + 'fb/instance/get';
			if(auth) {
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
			} else {
				deferredCreate.reject({message:'You must be logged in to create an instance'});
			}
			return deferredCreate.promise;
			};
	pyroMaster.$deleteInstance = function(argInstanceName){
		console.log('deleteInstance called with:', argInstanceName);
		var deferred = $q.defer();
		var auth = this.pyroRef.getAuth();
		const apiEndpoint = pyroServerUrl + 'delete';
		if(auth) {
			var postObj = {name: argInstanceName, uid:auth.uid};
			var self = this;
			// [TODO] put deleteObject after successful return of delete server call. It is flipped becuase delete functionality fails on server (deleting fb instance)
			self.$deleteObject('instances', argInstanceName).then(function(){
				$http.post(apiEndpoint, postObj).success(function(data, status, headers){
					console.log('Delete call responded:', data, status);
					console.log('Delete instace completed successfully for:', argInstanceName);
					deferred.resolve();
				}).error(function(data, status, headers){
					console.warn('[pyroMaster.$deleteInstance] Error deleting firebase instance, but Bucket and app were deleted:', data);
					deferred.resolve();
					// deferred.reject(data);
				});
			}, function(){
				console.error('[pyroMaster.$deleteInstance] error deleting app instance');
				deferred.reject();
			});
		} else {
			deferred.reject({message:'You must be logged in to delete an instance'});
		}
		return deferred.promise;
	}
	pyroMaster.$pyroLogin = function(argLoginData){
		console.log('[pyroMaster] $pyroLogin called');
		var deferred = $q.defer();
		// Check for existance of email, password, and code
		if(argLoginData) {
			pyroMaster.$getFbAccount(argLoginData).then(function(fbAccount){
        pyroMaster.$login(argLoginData).then(function(userData){
        	auth = userData.auth;
      		pyroMaster.$saveFbAccountData(fbAccount).then(function(){
      			console.log('[pyroMaster.$pyroLogin] pyroLogin completed successfully. Returning:', userData);
      			deferred.resolve(userData);
      		}, function(err){
      			console.error('[pyroMaster.$pyroLogin] Error saving fbAccountData:', err);
        		deferred.reject({error:err, message:'Error saving Firebase data'});
      		})
      	}, function(err){
      		console.error('[pyroMaster.$pyroLogin] Error logging into Pyro:', err);
        	deferred.reject({error:err, message:'Error logging into Pyro'});
      	});
      }, function(err){
        deferred.reject(err);
      });
		} else {
      deferred.reject({error:"INVAILD_PARAMS", message:'Invalid Login Params'});
		}
		return deferred.promise;
	};
	pyroMaster.$lockedSignup = function(argSignupData){
		console.log('[pyroMaster] $lockedSignup called');
		var deferred = $q.defer();
		const dataLocation = 'alphaData';
		const codesLocation = 'signupCodes';
		const eventInfoLocation = 'usage';
		var dataRef = pyroMaster.mainRef.child(dataLocation);
		// Check for existance of email, password, and code
		if(argSignupData && argSignupData.hasOwnProperty('code')) {
			var formattedCode = argSignupData.code.toLowerCase();
			dataRef.child(codesLocation).child(formattedCode).once('value', function(codeSnap){
				// Check for matching firebase account and attempt to create a new one if info doesn't already exist
				if(codeSnap.val()){
      		$analytics.eventTrack('User Signup', {category:'Session', label: formattedCode});
					pyroMaster.$getFbAccount(argSignupData).then(function(fbAccount){
		      	console.warn('[pyroMaster.$lockedSignup] Firebase account exists and logged in successfully:', fbAccount);
						// Signup to Pyro
	      	  pyroMaster.$signup(argSignupData).then(function(userAccount){
				      console.log('[pyroMaster.$lockedSignup] pyro signup successful:', userAccount);
							// Save usage of code
							var auth = pyroMaster.mainRef.getAuth();
							if(auth && auth.hasOwnProperty('uid')) {
								dataRef.child(eventInfoLocation).child(formattedCode).push({uid: auth.uid, createdAt:Firebase.ServerValue.TIMESTAMP});
								console.log('[pyroMaster.$lockedSignup] usage of code pushed to firebase');
							}
				      // Save fb data to firebase
				      pyroMaster.$saveFbAccountData(fbAccount).then(function(){
				      	deferred.resolve(userAccount);
				      }, function(err){
								console.error('[PyroMaster.$lockedSignup]fbData set error:', err);
				      	deferred.reject(err);
				      });
				    }, function(err){
				      console.warn('[pyroMaster.$lockedSignup] Signup error:', err.message);
				      deferred.reject(err);
				    });
		    	}, function(err){
		      	console.error('[pyroMaster.$lockedSignup] Get Firebase account error:', err);
		      	deferred.reject(err);
		    	});
				} else {
					deferred.reject({message:'Invalid Signup Code', error:"INVALID_CODE"});
				}
			}, function(err){
				console.error('[pyroMaster.$lockedSignup] Error writing code usage to FB:', err);
				deferred.reject(err);
			});
		} else {
			deferred.reject({message:'Invalid signup params', error:"INVAILD_PARAMS"})
		}
		// Check for exising Pyro account
		return deferred.promise;
	};
	pyroMaster.$pyroSignup = function(argSignupData){
		console.log('[pyroMaster] $pyroSignup called');
		var deferred = $q.defer();
		// Check for existance of email, password, and code
		if(argSignupData) {
			// Check for matching firebase account and attempt to create a new one if info doesn't already exist
  		$analytics.eventTrack('User Signup', {category:'Session'});
			pyroMaster.$getFbAccount(argSignupData).then(function(fbAccount){
      	console.warn('[pyroMaster.$pyroSignup] Firebase account exists and logged in successfully:', fbAccount);
				// Signup to Pyro
    	  pyroMaster.$signup(argSignupData).then(function(userAccount){
		      console.log('[pyroMaster.$pyroSignup] pyro signup successful:', userAccount);
					var auth = pyroMaster.mainRef.getAuth();
		      // Save fb data to firebase
		      pyroMaster.$saveFbAccountData(fbAccount).then(function(){
		      	deferred.resolve(userAccount);
		      }, function(err){
						console.error('[PyroMaster.$pyroSignup]fbData set error:', err);
		      	deferred.reject(err);
		      });
		    }, function(err){
		      console.warn('[pyroMaster.$pyroSignup] Signup error:', err.message);
		      deferred.reject(err);
		    });
    	}, function(err){
      	console.error('[pyroMaster.$pyroSignup] Get Firebase account error:', err);
      	deferred.reject(err);
    	});
		} else {
			deferred.reject({message:'Invalid signup params', error:"INVAILD_PARAMS"})
		}
		// Check for exising Pyro account
		return deferred.promise;
	};
	pyroMaster.$saveFbAccountData = function(argFbAccountData) {
		console.log('[PyroMaster]$saveFbAccountData called:', argFbAccountData);
		var deferred = $q.defer();
		var auth = pyroMaster.mainRef.getAuth();
		console.log('[PyroMaster]$saveFbAccountData auth:', auth);
		self.pyroRef.child('fbData').child(auth.uid).setWithPriority(argFbAccountData, argFbAccountData.email, function(err){
			if(!err) {
				console.log('[PyroMaster.$saveFbAccountData]fbData set successful', argFbAccountData);
				deferred.resolve(argFbAccountData);
			} else {
				console.error('[PyroMaster.$saveFbAccountData]fbData set error:', err);
				deferred.reject(err);
			}
		});
		return deferred.promise;
	}
	pyroMaster.$createFbAccount = function(argSignupData){
		console.log('[PyroMaster]createFbAccount called:', argSignupData);
		var deferred = $q.defer();
		// [TODO] look into if password should just be uid to be able to get the account later
		if(argSignupData.hasOwnProperty('email') && argSignupData.hasOwnProperty('password')) {
			// Make sure password is long enough
			if(argSignupData.password.length >= 8){
				const endpointUrl = pyroServerUrl + 'fb/account/new';
				console.log('[pyroService PyroMaster.$createFbAccount] Calling to server endpoint:', endpointUrl);
				$http.post(endpointUrl, argSignupData).success(function(data, status, headers){
					console.warn('[pyroService PyroMaster.$createFbAccount]'+ endpointUrl + ' call returned data:', data, ' status:', status, ' headers:' ,headers);
					if(status && status == 200){
						console.log('account creation successful:', data);
						if(data.hasOwnProperty('account') && data.account.hasOwnProperty('token')){
							var fbAccountData = {token: data.account.token, email:argSignupData.email, createdAt: Firebase.ServerValue.TIMESTAMP};
							deferred.resolve(fbAccountData);
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
				console.error('Email must be at least 8 characters');
				deferred.reject();
			}
		} else {
			console.error('email and password necessary for creating a firebase account');
			deferred.reject();
		}
		return deferred.promise;
	}
	pyroMaster.$getFbAccount = function(argSignupData){
		console.log('[PyroMaster] getFbAccount called:', argSignupData);
		var self = this;
		var deferred = $q.defer();
		const getAccountEndpoint = pyroServerUrl + 'fb/account/get';
		// [TODO] look into if password should just be uid to be able to get the account later
		if(argSignupData.hasOwnProperty('email') && argSignupData.hasOwnProperty('password')) {
			// Make sure password is long enough
			if(argSignupData.password.length >= 8){
				var signupInfo = argSignupData;
				if(!storedFbAccount) {
					$http.post(getAccountEndpoint, argSignupData).success(function(data, status, headers){
						console.log('[pyroService pyroMaster.$getFbAccount] fb/acount/get returned:', data, status);
						if(status && status == 200){
							console.log('account load successful:', data, status);
							if(data.hasOwnProperty('adminToken')){
								var fbAccountData = {token: data.adminToken, email:argSignupData.email, createdAt: Firebase.ServerValue.TIMESTAMP};
								deferred.resolve(fbAccountData);
							} else {
								deferred.reject({status:500, message:'Invalid return from server'});
							}
						} else if(status && status == 204) {
							console.warn('[pyroService pyroMaster.$getFbAccount] status of $httppost is good:', status, data);
			        //Firebase information is incorrect
			        console.warn('[pyroService pyroMaster.$getFbAccount] Firebase login information does not match an existing account. Attempting to create a new Firebase account');
			        pyroMaster.$createFbAccount(argSignupData).then(function(accountData){
			        	console.warn('[pyroService pyroMaster.$getFbAccount] New Account created succesfully and returned accountData:', accountData);
			        	deferred.resolve(accountData);
			        }, function(err){
			        	console.error('[pyroMaster.$getFbAccount] Error gettingFBAccount:', err);
								deferred.reject(err);
			        });
						} else if(data.hasOwnProperty('status')) {
							console.warn('[pyroMaster.$getFbAccount] has own property status, but not status on $httpPost?', data.status);
							deferred.reject({status:data.status});
						} else {
							console.error('[pyroMaster.$getFbAccount] account load not successful:', status);
							deferred.reject(data);
						}
					}).error(function(data, status, headers){
						console.log('[pyroMaster.$getFbAccount] error getting fb account:',headers);
						deferred.reject(data);
					});
				} else {
					//Fb account was logged into prior
					console.log('[pyroMaster.$getFbAccount] Stored fb account found:', storedFbAccount);
					deferred.resolve(storedFbAccount);
				}
			} else {
				console.log('[pyroMaster.$getFbAccount] Email must be at least 8 characters');
				deferred.reject({message:'Email must be at least 8 characters long', error:"INVALID_PASS"});
			}
		} else {
			console.log('[pyroMaster.$getFbAccount] Invalid login credentials');
			deferred.reject({message:'Email and password necessary for login', error:"INVALID_PARAMS"});
		}
		return deferred.promise;
	};
	// [TODO] Make this work even if user refreshes between fbLogin and signup
	var storedFbAccount = null;
	pyroMaster.$fbLogin = function(argLoginData){
			console.log('[pyroMaster] $fbLogin called');
		var deferred = $q.defer();
		const dataLocation = 'alphaData';
		const eventInfoLocation = 'fbLogins';
		var dataRef = pyroMaster.mainRef.child(dataLocation);
		// Check for existance of email, password, and code
		if(argLoginData && argLoginData.hasOwnProperty('email')) {
			// Check for matching firebase account and attempt to create a new one if info doesn't already exist
  		$analytics.eventTrack('FB Login', {category:'External'});
			pyroMaster.$getFbAccount(argLoginData).then(function(fbAccount){
      	console.warn('[pyroMaster.$fbLogin] Firebase account exists and logged in successfully:', fbAccount);
				// Signup to Pyro
				storedFbAccount = fbAccount;
				deferred.resolve(fbAccount);
    	}, function(err){
      	console.error('[pyroMaster.$fbLogin] Get Firebase account error:', err);
      	deferred.reject(err);
    	});
		} else {
			deferred.reject({message:'Invalid signup params', error:"INVAILD_PARAMS"})
		}
		// Check for exising Pyro account
		return deferred.promise;
	};
	return pyroMaster;
}])
