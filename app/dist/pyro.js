/* Pyro for Firebase*/
	
  function Pyro () {
    //Check for existance of Firebase
    console.log('NewPyro');
    if(typeof Firebase != 'undefined') {
      this.pyroRef = new Firebase('http://pyro.firebaseio.com');
      this.usersRef = this.pyroRef.child('users');
      this.instancesRef = this.pyroRef.child('instances');

      //for incorrect scope
      if (window === this) {
        return new _(id);
      }
      return this
    }
    else throw Error('Firebase library does not exist. Check that firebase.js is included in your index.html file.');

  }

   Pyro.prototype = {
      login: function(argLoginData, successCb, errorCb) {
        console.log('Pyro login:', arguments);
        var currentThis = this;
        this.pyroRef.authWithPassword(argLoginData, function(error, authData) {
          if (error === null) {
            // user authenticated with Firebase
            console.log("User ID: " + authData.uid + ", Provider: " + authData.provider);
            // successCb(authData);
            // Add account if it doesn't already exist
            checkForUser(argLoginData, currentThis.usersRef, function(userAccount){
              successCb(userAccount);
            });
          } else {
            console.error("Error authenticating user:", error);
            // [TODO] Return object if available
            errorCb(error);
          }
        });
      },
      signup:function(argSignupData, successCb, errorCb) {
        console.log('Pyro signup called:', arguments);
        if(argSignupData && argSignupData.email && argSignupData.password) {
          var currentThis = this;
          var usersRef = this.usersRef;
          this.pyroRef.createUser(argSignupData, function(error) {
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
      },
      getAuth: function() {
        var authData = this.pyroRef.getAuth();
        if (authData) {
          console.log('getAuth returned:', authData);
          return authData;
        } else {
          console.log('Not Authenticated');
          return null;
        }
      },
      getUser: function(callback) {
        if (this.getAuth() != null) {
          console.log('Authenticated user with email:', this.getAuth().password.email);
          checkForUser(this.getAuth().password, this.usersRef, function(returnedAccount){
            console.log('checkForUser loaded user:', returnedAccount);
            callback(returnedAccount);
          });
        } else {
          callback(null);
        }
      },
      // Functions specific to managing Pyro instances (Pyro inception)
      getInstances: function(callback) {
        // [TODO] Better method of checking auth
        var instancesRef = this.instancesRef;
        this.getUser(function(account){
          if(account != null) {
            console.log('getInstances running for:', account);
            instancesRef.orderByChild('author').equalTo(account.email).on('value', function(userInstancesSnap){
              callback(userInstancesSnap.val());
            });
          } 
        });
      },
      loadInstance: function(argInstanceData, successCb, errorCb) {
        console.log('loadInstance:', argInstanceData);
        this.currentInstance = {name:argInstanceData.name}
        checkForInstance(this, function(instanceRef){
          successCb(instanceRef.val());
        }, errorCb);
      },
      instanceRef: function(argInstanceData, successCb, errorCb) {
        console.log('loadInstance:', argInstanceData);
        this.currentInstance = {name:argInstanceData.name}
        checkForInstance(this, successCb, errorCb);
      },
      addAdminModule: function() {
        console.log('add admin module called', this);
        if(PyroAdmin) {
          console.log('PyroAdmin exists... Creating instance');
          var pyroAdmin = new PyroAdmin(this);
        }
      },
      createInstance: function (argPyroData, successCb, errorCb) {
        if(argPyroData.hasOwnProperty('name') && argPyroData.hasOwnProperty('secret')){
          this.name = argPyroData.name;
          this.secret = argPyroData.secret;
          this.url = "https://"+ this.name +".firebaseio.com";
          // [TODO] Check that url is firebase
          this.mainRef = new Firebase(this.url);
          checkForInstance(this, function(returnedInstance){
            successCb(returnedInstance);
          });
          //for incorrect scope
          if (window === this) {
              return new _(id);
           }
          //request admin auth token
          
          // var xmlhttp = new XMLHttpRequest();
          //   xmlhttp.open("POST", "http://pyro-server.herokuapp.com/auth");
          //   xmlhttp.onreadystatechange = function() {
          //     if (xmlhttp.readyState==4 && xmlhttp.status==200) {
          //       console.log('xmlresponse:', xmlhttp.responseText);
          //       // document.getElementById("myDiv").innerHTML=xmlhttp.responseText;
          //     }
          //   }
          //   xmlhttp.setRequestHeader("Content-Type","application/x-www-form-urlencoded", true);

          //   xmlhttp.send("secret=" + this.secret);
          //Login to firebase
          
          // this.mainRef.authWithPassword()
        } else {
          console.log('Missing app info.');
          if(argPyroData.hasOwnProperty('name')) {
            errorCb({message:'Please enter the name of your firebase instance.'});
          } else {
            errorCb({message:'Please enter your firebase secret'})
          }
        }
      }
  };
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
            // Update existing moderator
            console.log('Usersnap:', querySnapshot.val());
            var userAccount = _.find(querySnapshot.val(), function(user){
              return user.email == userEmail; 
            });
            callback(userAccount);
          } else {
            // User account does not exist
            var userObj = {email: userEmail, createdAt: Date.now(), role:10}
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