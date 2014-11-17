   function passwordLoginToRef(argRef, argLoginData, successCb, errorCb) {
    console.log('passwordLogin:', arguments);
    argRef.authWithPassword(argLoginData, function(error, authData) {
      if (error === null) {
        // user authenticated with Firebase
        console.log("User ID: " + authData.uid + ", Provider: " + authData.provider);
        // Manage presense
        // Add account if it doesn't already exist
        var usersRef = argRef.child('users');
        checkForUser(argLoginData, usersRef, function(userAccount){
          successCb(userAccount);
        });
      } else {
        console.error("Error authenticating user:", error);
        // [TODO] Return object if available
        errorCb(error);
      }
    });
   }
   function emailSignupToRef(argSignupData, argRef, successCb, errorCb) {
        if(argSignupData && argSignupData.email && argSignupData.password) {
          var currentThis = this;
          var usersRef = argRef.child('users');
          argRef.createUser(argSignupData, function(error) {
            if (error === null) {
              console.log("User created successfully");
              // Push new user data to users folder
              checkForUser(argSignupData, usersRef, function(userAccount) {
                currentThis.login(argSignupData, function(authData){
                  successCb(authData);
                });
              });
            } else {
              console.error("Error creating user:", error.message);
              errorCb(error.message);
            }
          });
        } else {
          //some data is missing
          var dataError = 'Invalid Data';
          if(!argSignupData.email) {
            //email must be whats missing
            dataError ='Please enter an email';
          } else {
            dataError = 'Please enter a password';
          }
          errorCb(dataError);
        }
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
          // Single Checking function for all user types (should be in one folder)
       // [TODO] Fix repative code within if statements
    function checkForUser(argUserData, argUsersRef, callback) {
      console.log('CheckForUser:', argUserData);
      var userEmail = null;
      // [TODO] Change to switch statement
      // [TODO] Change to using provider folder (password if for email/password)
      if(argUserData.hasOwnProperty('email') || argUserData.hasOwnProperty('password')) {
        if (argUserData.hasOwnProperty('password')){
          userEmail = argUserData.password.email;
        }
        else if(argUserData.hasOwnProperty('email')) {
          // object contains email
          userEmail = argUserData.email;
        }
        argUsersRef.startAt(userEmail).endAt(userEmail).on("value", function(querySnapshot) {
          if(querySnapshot.val() != null) {
            // Update existing user
            console.log('Usersnap:', querySnapshot.val());
            var userAccount = _.find(querySnapshot.val(), function(user){
              return user.email == userEmail; 
            });
            callback(userAccount);
          } else {
            // User account does not exist
            var userObj = {email: userEmail, createdAt: Date.now(), role:10};
            var newUserRef = argUsersRef.push(userObj);
            console.log('New user pushed successfully');
            newUserRef.setPriority(userEmail, function(){
              console.log('email priority set');
              newUserRef.once('value', function(querySnapshot){
                callback(querySnapshot.val());
              });
            });
          }
        });
      }
      else {
        console.error('Incorrect user info');
      } 
    }
    function createNewInstance(argPyro, successCb, errorCb) {
      checkForInstance(argPyro, function(returnedInstance){
        if(returnedInstance == null) {
          instanceList.child(argPyro.name).set(instanceData, function(){
            argPyro.pyroRef = instanceList.child(argPyro.name);
            if(successCb) {
              successCb(argPyro.pyroRef);
            }
          });
        } else {
          var err = {message:'App already exists'}
          console.warn(err.message);
          errorCb(err);
        }
      });
    }
    function checkForInstance(argPyro, callback) {
      // [TODO] Add user's id to author object?
      //check for app existance on pyroBase
      console.log('checkForInstance:', argPyro);
      var instanceList = argPyro.pyroRef.child("instances");
      var instanceName = argPyro.currentInstance.name;
      instanceList.orderByChild("name").equalTo(instanceName).once('value', function(usersSnap){
        console.log('usersSnap:', usersSnap);
        if(usersSnap.val() == null) {
          console.log('App does not already exist');
          // Add instance to instance list under the instance name
          callback(null);
        }
        else {
          console.log('app already exists');
          if(callback) {
            callback(usersSnap.child(instanceName));
          }
        }
      });
   }