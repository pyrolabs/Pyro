angular.module('pyro', [])

.factory('pyroService', ['$rootScope','$q', 'FBURL', function($rootScope, $q, FBURL) {
	var auth = null;
	var account = null;
	var pyro = new Pyro({url:FBURL});
	return {
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
			}, function(){
				deferredLogin.reject();
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
					deferred.resolve();
				});
			}
			return deferred.promise;
		},
		passwordLogin: function(argUserData) {
			console.log('passwordLogin:', arguments);
			var deferred = $q.defer();
			fbutil.ref().authWithPassword(argUserData, function(error, authData){
				if (error) {
			    console.log('Login Failed!', error);
			    deferred.reject(error);
			  } else {
			    console.log('Authenticated successfully with payload:', authData);
			    deferred.resolve(authData);
			  }
			});
			return deferred.promise;
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
		getAuth: function(){
			return pyro.getAuth();
		}
	}
}])

// .factory('sessionService', ['$rootScope','fbutil', '$q', '$cordovaDevice', 'AUTHURL', '$http', '$ionicPlatform', function($rootScope, fbutil, $q, $cordovaDevice, AUTHURL, $http, $ionicPlatform) {
// 	var auth = null;
// 	function requestToken() {
// 		console.log('requestToken called');
// 		var deferred = $q.defer();
// 		var params = {};
// 		if(!angular.isUndefined($cordovaDevice)) {
// 			params.uuid = $cordovaDevice.getUUID();
// 		}
// 		//else {// use browser finger print}
// 		console.log('Requesting to: ', AUTHURL, ' with: ', params);
// 		$http.post(AUTHURL, params).success(function(results){
// 			console.log('Token server returned: ', results);
// 			deferred.resolve(results);
// 		}).error(function(err){
// 			console.error('error posting to token server:', err);
// 			deferred.reject(err);
// 		});
// 		return deferred.promise;
// 	}
// 	function tokenLogin(argTokenObj, callback) {
// 		console.log('tokenLogin called: ', argTokenObj);
// 		var ref = new Firebase("https://kyper-snapsell.firebaseio.com");
// 		ref.authWithCustomToken(argTokenObj.authToken, function(error, authData) {
// 		  if (error) {
// 		    console.log("Login Failed!", error);
// 		    callback(authData, error);
// 		  } else {
// 		    console.log("Login Succeeded!", authData);
// 		    auth = authData;
// 		    callback(authData);
// 		  }
// 		});
// 	}
// 	return {
// 		login: function(argToken) {
// 			fbutil.ref().authWithCustomToken(AUTH_TOKEN, function(error, authData) {
// 			  if (error) {
// 			    console.log("Login Failed!", error);
// 			  } else {
// 			    console.log("Login Succeeded!", authData);
// 			    auth = authData;
// 			  }
// 			});
// 		},
// 		getUser:function() {
// 			var deferred = $q.defer();
// 			if(auth != null) {
// 				deferred.resolve(auth);
// 			}
// 			else {
// 				requestToken().then(function(token) {
// 					tokenLogin(token, function(authData){
// 						console.log('tokenLogin completed returning:', authData);
// 						deferred.resolve(authData)
// 					});
// 				});
// 			}
// 			return deferred.promise;
// 		},
// 		passwordLogin: function(argUserData) {
// 			console.log('passwordLogin:', arguments);
// 			var deferred = $q.defer();
// 			fbutil.ref().authWithPassword(argUserData, function(error, authData){
// 				if (error) {
// 			    console.log('Login Failed!', error);
// 			    deferred.reject(error);
// 			  } else {
// 			    console.log('Authenticated successfully with payload:', authData);
// 			    deferred.resolve(authData);
// 			  }
// 			});
// 			return deferred.promise;
// 		},
// 		logout: function() {
// 			fbutil.ref().unauth();
// 		},
// 		getAuth: function(){
// 			return fbutil.ref().getAuth();
// 		}
// 	}
// }])