angular.module('pyro.service', [])
.factory('pyro', ['$rootScope', 'FBURL','pyroMaker',  function($rootScope, FBURL, pyroMaker) {
	return pyroMaker(FBURL);
}])
.factory('pyroMaster', ['pyroMaker',  function(pyroMaker) {
	return pyroMaker('http://pyro.firebaseio.com');
}])
.factory('pyroMaker', ['$q', function($q){
	return function (argPyroUrl){
		var auth = null;
		var account = null;
		var pyro = new Pyro({url:argPyroUrl});
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
				pyro.createObject(argListName, argObject, function(newObject){
					deferredCreate.resolve(newObject);
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