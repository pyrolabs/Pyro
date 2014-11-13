/* Pyro for Firebase*/
	
  function Pyro () {
    //Check for existance of Firebase
    console.log('NewPyro');
    if(typeof Firebase != 'undefined') {
      this.pyroRef = new Firebase('http://pyro.firebaseio.com');
      this.usersRef = this.pyroRef.child('users');
      //for incorrect scope
      if (window === this) {
        return new _(id);
      }
      return this
    }
    else throw Error('Firebase library does not exist. Check that firebase.js is included in your index.html file.');

  }
   function checkForInstance(argPyro, callback) {
      var instanceData = {name:argPyro.name, secret: argPyro.secret, url: argPyro.url};
      var pyroBase = argPyro.pyroRef;
      //check for app existance on pyroBase
      var instanceList = pyroBase.child("instances");
      instanceList.orderByChild("name").equalTo(argPyro.name).once('value', function(usersSnap){
        console.log('usersSnap:', usersSnap);
        if(usersSnap.val() == null) {
          console.log('App does not already exist');
          instanceList.child(argPyro.name).set(instanceData);
          argPyro.pyroRef = instanceList.child(argPyro.name);
          if(callback) {
            callback(argPyro.pyroRef);
          }
        }
        else {
          console.log('app already exists');
          if(callback) {
            callback(instanceList.child(argPyro.name));
          }
        }
      });
   }
   Pyro.prototype = {
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
      },
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
      }
  };
       // Single Checking function for all user types (should be in one folder)
    function checkForUser(argUserData, argUsersRef, callback) {
      console.log('CheckForUser:', argUserData);
      argUsersRef.startAt(argUserData.email).endAt(argUserData.email).once("value", function(querySnapshot) {
        if(querySnapshot.val() != null) {
          // Update existing moderator
          console.log('Usersnap:', querySnapshot.val());
          var userAccount = _.find(querySnapshot.val(), function(user){
            return user.email == argUserData.email; 
          });
          callback(userAccount);
        } else {
          // User account does not exist
          var userObj = {email: argUserData.email, createdAt: Date.now(), role:10}
          var newUserRef = argUsersRef.push(userObj);
          console.log('New user pushed successfully');
          newUserRef.setPriority(argUserData.email, function(){
            console.log('email priority set');
            newUserRef.once('value', function(querySnapshot){
              callback(querySnapshot.val());
            });
          });
        }
      });
    }