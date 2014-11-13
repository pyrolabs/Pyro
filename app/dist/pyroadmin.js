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
