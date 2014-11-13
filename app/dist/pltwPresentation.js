/* Pyro for Firebase*/
	
  function PltwPresentation () {
    //Check for existance of Firebase
    if(Firebase) {
      this.mainRef = new Firebase("https://pltw-presenter.firebaseio.com/")
      this.chatRef = mainRef.child("chat");
      this.usersRef = mainRef.child("users");
      this.adminsRef = mainRef.child("admins");
      this.moderatorsRef = mainRef.child("moderators");
      return this;
    }
    else throw Error('Firebase library does not exist. Check that firebase.js is included in your index.html file.');
  }
   PltwPresentation.prototype = {
      anonymousLogin: function(successCb, errorCb) {
        console.log('AnonymousLogin');
        this.mainRef.authAnonymously(function(error, authData){
          if(!error) {
            this.auth = authData;
            //Data stored in firebase folder
            authData.createdAt = Date.now();
            var currentAnonymous = this.usersRef.push(authData);
            successCb(authData);
          }
          else {
            console.error('Error in anonymousLogin', error);
            errorCb(error);
          }
        });
      },
      adminSignupAndLogin:function(argSignupData, successCb, errorCb) {
        if(argSignupData && argSignupData.email && argSignupData.password) {
          this.mainRef.createUser(argSignupData, function(error) {
            if (error === null) {
              console.log("User created successfully");
              this.adminsRef.push(argSignupData);
              // [TODO] Set priority for querying
              this.adminLogin(argSignupData, function(authData){
                successCb(authData);
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
      adminLogin:function(argLoginData, successCb, errorCb) {
        console.log('AdminLogin');
        this.mainRef.authWithPassword(argLoginData, function(error, authData) {
          if (error === null) {
            // user authenticated with Firebase
            console.log("User ID: " + authData.uid + ", Provider: " + authData.provider);
            successCb(authData);
          } else {
            console.error("Error authenticating user:", error);
            // [TODO] Return object if available
            errorCb(error);
          }
        });
      },
      moderatorLogin: function(argLoginData, successCb, errorCb) {
        console.log('AdminLogin');
        this.mainRef.authWithPassword(argLoginData, function(error, authData) {
          if (error === null) {
            // user authenticated with Firebase
            console.log("User ID: " + authData.uid + ", Provider: " + authData.provider);
            //Add last login
            authData.lastLogin = Date.now();
            checkForModerator(authData, this.moderatorsRef, function(){
            });
            
          } else {
            console.error("Error authenticating user:", error);
            // [TODO] Return object if available
            errorCb(error);
          }
        });
      }
      // Single Checking function for all user types (should be in one folder)
      function checkForModerator(argUserData, argModeratorsRef, callback) {
        var userRef = argModeratorsRef.orderByChild(argUserData.email).on("value", function(userSnapshot) {
          if(userSnapshot.val() != null) {
            // Update existing moderator
            userRef.child('lastLogin').set(Date.now());
            successCb(userSnapshot.val());
          } else {
            // New Moderator
            var newModRef = argModeratorsRef.push(argUserData);
            newModRef.setPriority(argUserData.email, function(){
              newModRef.once('value', function(modSnap){
                callback(modSnap.val());
              });
            });
          }
        });
      }

  };