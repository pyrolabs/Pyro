/* PyroAdmin - Administration/Analytics pannel for Firebase*/

    function PyroAdmin (argPyro) {
			if(typeof Firebase != 'undefined') {
		    console.log('New PyroAdmin');
	      this.mainRef = argPyro.mainRef;
	      this.messagesRef = this.mainRef.child("messages");
	      this.usersRef = this.mainRef.child("users");
	      return this;
	    }
			else {
				var err = 'Incorrect parameters for new PyroAdmin';
				console.error(err);
				throw new TypeError(err);
			}
    }

    PyroAdmin.prototype = {
    	anonymousLogin: function(successCb, errorCb) {
        console.log('AnonymousLogin');
        // [TODO] Fix scope/this problem
        var currentThis = this;
        this.mainRef.authAnonymously(function(error, authData){
          if(!error) {
            console.log('Authed anonymously. This:', this);
            this.auth = authData;
            authData.createdAt = Date.now();
            //Added to user folder with a role value of 0
            var currentAnonymous = currentThis.usersRef.push(authData);
            currentAnonymous.child('role') = 0;
            console.log('anonymousLogin callingback with: ', currentAnonymous);
            successCb(currentAnonymous);
          }
          else {
            console.error('Error in anonymousLogin', error);
            errorCb(error);
          }
        });
      },
      userLogin:function(argLoginData, successCb, errorCb) {
        console.log('userLogin');
        var currentThis = this;
        this.mainRef.authWithPassword(argLoginData, function(error, authData) {
          if (error === null) {
            // user authenticated with Firebase
            console.log("User ID: " + authData.uid + ", Provider: " + authData.provider);
            successCb(authData);
            // Add account if it doesn't already exist
            // checkForUser(argLoginData, currentThis.usersRef, function(userAccount){
            //   successCb(userAccount);
            // });
          } else {
            console.error("Error authenticating user:", error);
            // [TODO] Return object if available
            errorCb(error);
          }
        });
      },
      userSignup:function(argSignupData, successCb, errorCb) {
      	console.log('userSignup called:', arguments);
        if(argSignupData && argSignupData.email && argSignupData.password) {
          var currentThis = this;
          var usersRef = this.usersRef;
          this.mainRef.createUser(argSignupData, function(error) {
            if (error === null) {
              console.log("User created successfully");
              // Push new user data to users folder
              checkForUser(argSignupData, usersRef, function(userAccount) {
                currentThis.userLogin(argSignupData, function(authData){
                  successCb(authData);
                });
              });
            } else {
              console.error("Error creating user:", error);
              errorCb(error);
            }
          });
        } else {
          throw Error('Invalid signupData');
        }
      },
      // [TODO] Functionality to get count of different types of users (admin/user/anonymous)
      userCount: function(callback) {
        this.usersRef.on('value', function(usersListSnap) {
          callback(usersListSnap.numChildren());
        });
      }
    };
   function User(argAuthData) {
    console.log('NEW User');

    return this;
   }
   User.prototype = {
    account: function() {

    },
    
   }
   function setupPresence(argUserId, argMainRef, callback) {
    console.log('setupPresence:', arguments);
    var amOnline = argMainRef.child('.info/connected');
    var onlineRef = argMainRef.child('online').child(argUserId);
    var sessionsRef = argMainRef.child('sessions');
    var userRef = argMainRef.child('users').child(argUserId);
    var userSessionRef = argMainRef.child('users').child(argUserId).child('sessions');

    amOnline.on('value', function(snapShot){
      if(snapShot.val()) {
        //user is online
        // add session and set disconnect
        var session = sessionsRef.push({began: Firebase.ServerValue.TIMESTAMP, user:argUserId});
        session.onDisconnect().child('ended').set(Firebase.ServerValue.TIMESTAMP);
        // add to past sessions list
        sessionsRef.onDisconnect().push(sessionInfo);
        //add correct session id to user
        // adding session id to current list under user's session
        userSessionRef.child('current').set(session.name());
        // Remove session id from users current session folder
        userSessionRef.child('current').onDisconnect().remove();
        // Add session id to past sessions on disconnect
        userSessionRef.child('past').onDisconnect().set(session.name());
        // remove from presense list
        onlineRef.set(true);
        onlineRef.onDisconnect().remove();
      }
    });
   }