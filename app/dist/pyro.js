/* Pyro for Firebase*/
  var pyroRef = new Firebase('http://pyro.firebaseio.com');
  function Pyro (argPyroData) {
    //Check for existance of Firebase
    console.log('NewPyro');
    if(typeof Firebase != 'undefined') {
      if(argPyroData.hasOwnProperty('name') && argPyroData.hasOwnProperty('secret')){
        this.name = argPyroData.name;
        this.secret = argPyroData.secret;
        this.url = "https://"+ this.name +".firebaseio.com";
        // [TODO] Check that url is firebase
        this.mainRef = new Firebase(this.url);
        this.pyroRef = pyroRef;
        // checkForInstance(this, function(returnedInstance){
        //   successCb(returnedInstance);
        // });
        //for incorrect scope
        // if (window === this) {
        //     return new _(id);
        //  }
      } else {
        console.log('Missing app info.');
        if(argPyroData.hasOwnProperty('name')) {
          errorCb({message:'Please enter the name of your firebase instance.'});
        } else {
          errorCb({message:'Please enter your firebase secret'})
        }
      }
      return this
    }
    else throw Error('Firebase library does not exist. Check that firebase.js is included in your index.html file.');

  }
   Pyro.prototype = {
      userSignup: function(argUserData, successCb, errorCb) {
        emailSignup(argSignupData, successCb, errorCb);
      },
      authAnonymously: function(){
        //check for auth info
        var auth = this.mainRef.getAuth();
        console.log('authAnonymously', auth);
        var currentThis = this;
        if(auth != null) {
          this.mainRef.authAnonymously(function(error, authData){
            if (error) {
              console.log('Login Failed!', error);
            } else {
              console.log('Authenticated successfully with payload:', authData);
              var anon = {uid: authData.uid, provider:authData.provider};
              currentThis.mainRef.child('users').child(authData.uid).set(anon);
            }
          });
        } else {
          //auth exists
        }
      },
      login: function(argLoginData, successCb, errorCb) {
        console.log('Pyro login:', arguments);
        var currentThis = this;
        // check for existnace of main ref
        this.authWithPassword(argLoginData, this.mainRef, successCb, errorCb);
      },
      getAuth: function() {
        var authData = this.mainRef.getAuth();
        if (authData) {
          console.log('getAuth returned:', authData);
          return authData;
        } else {
          console.log('Not Authenticated');
          return null;
        }
      },
      getListByAuthor: function(argListName, callback) {
        var auth = this.getAuth();
        if(auth != null) {
          this.mainRef.child(argListName).orderByChild('author').startAt(auth.uid).endAt(auth.uid).on('value', function(listSnap){
            callback(listSnap.val());
          });
        } else {
          console.warn('listByAuthor cannot load list without current user');
        }
      },
      createObject: function(argListName, argObject, callback) {
        var auth = this.getAuth();
        if(auth) {
          argObject.author = auth.uid;
        }
        var newObj = this.mainRef.child(argListName).push(argObject, function(){
          console.log('New object of type:' + argListName + ' was created successfully:', newObj);
          callback(newObj);
        })
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
  //------------ Instance action functions -----------------//
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
   //------------- User ---------------//
   function User(argUserData, argMainRef) {
    console.log('NEW User');
    if(argUserData.hasOwnProperty('email')) {
      this.email = argUserData.email
    } else {
      throw Error('Email needed to create user');
    }
    this.account = checkForUser(argUserData.email, argMainRef, function(returnedAccount){
      return returnedAccount;
    })
    return this;
   }
   function getAccountOrSignup(){
    return checkForUser(argUserData, argMainRef, function(userAccount){
      if(userAccount != null) {
        return userAccount;
      } else {
        return new User(argUserData, this);
        emailSignup(argUserData, function(returnedUser){

        }, function(){

        });
      }
    })
   }
  function authWithPassword(argLoginData, argRef, successCb, errorCb) {
    this.mainRef.authWithPassword(argLoginData, function(error, authData) {
      if (error === null) {
        // user authenticated with Firebase
        console.log("User ID: " + authData.uid + ", Provider: " + authData.provider);
        // Manage presense
        setupPresence(authData.uid, argRef);
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
  }
  function emailSignup(argSignupData, successCb, errorCb) {
    this.mainRef.createUser(argSignupData, function(error) {
      if (error === null) {
        console.log("User created successfully");
        // Login with new account and create profile
          currentThis.login(argSignupData, function(authData){
            createUserProfile(authData, currentThis.mainRef, function(userAccount){
              var newUser = new User(authData);
                successCb(newUser);
            });
          });
      } else {
        console.error("Error creating user:", error.message);
        errorCb(error.message);
      }
    });
  }
            
  function createUserProfile(argAuthData, argRef, callback) {
    console.log('createUserAccount called');
    var userRef = argRef.child('users').child(argAuthData.uid);
    var userObj = {role:10, provider: argAuthData.provider};
    if(argAuthData.provider == 'password') {
      userObj.email = argAuthData.password.email;
    }
    userRef.on('value', function(userSnap){
      if(userSnap.val() == null) {
        userObj.createdAt = Firebase.ServerValue.TIMESTAMP
        userRef.setWithPriority(userObj, userEmail, function(){
          console.log('New user account created:', userSnap.val());
          callback(userSnap.val());
        });
      } else {
        console.error('User account already exists');
        throw Error('User account already exists');
      }
    });
  } 
   function setupPresence(argUserId, argMainRef) {
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
        argUsersRef.child(argUserData.uid).on("value", function(querySnapshot) {
            callback(querySnapshot.val());
          if(querySnapshot.val() != null) {
            console.log('Usersnap:', querySnapshot.val());
          } 
        });
      }
      else {
        console.error('Incorrect user info');
      }
      
    }