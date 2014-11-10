/* Pyro for Firebase*/
	
  function Pyro (argPyroData) {
    //Check for existance of Firebase
    console.log('NewPyro:', argPyroData);
    if(Firebase && window.jQuery) {
      if(argPyroData.hasOwnProperty('name') && argPyroData.hasOwnProperty('secret')){
        this.name = argPyroData.name;
        this.secret = argPyroData.secret;
        this.url = "https://"+ this.name +".firebaseio.com";
        this.mainRef = new Firebase(this.url);
        checkForInstance(this);
        //for incorrect scope
        if (window === this) {
            return new _(id);
         }
        return this
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
      }
      else throw Error('Incorrect Pyro Object Format');
    }
    else throw Error('Firebase library does not exist. Check that firebase.js is included in your index.html file.');

  }
   function checkForInstance(argPyro, callback) {
      var instanceData = {name:argPyro.name, secret: argPyro.secret, url: argPyro.url};
      var pyroBase = new Firebase("https://pyro.firebaseio.com/");
      //check for app existance on pyroBase
      var instanceList = pyroBase.child("instances");
      instanceList.orderByChild("name").equalTo(argPyro.name).once('value', function(usersSnap){
        console.log('usersSnap:', usersSnap);
        if(usersSnap.val() == null) {
          console.log('App does not already exist');
          instanceList.child(argPyro.name).set(instanceData);
          argPyro.pyroRef = instanceList.child(argPyro.name);
          if(callback) {
            callback();
          }
        }
        else {
          console.log('app already exists');
          if(callback) {
            callback();
          }
        }
      });
   }
   Pyro.prototype = {
      createInstance: function (argData) {
      	//Check for existance of
       	console.log('createInstance called');
        return new Pyro(argData);

        // $.ajax({type:'POST', 
        //   url:"https://pyro-server.herokuapp.com/auth", 
        //   data:{"secret": this.secret, name: this.name}, 
        //   success:function(result){
        //     console.log('auth post successful:', result);
        //     pyro.authWithCustomToken(result, function(user){
        //       console.log('login successful:', user);
        //     });
        //   }
        // });
      },
      addAdminModule: function() {
        console.log('add admin module called', this);
        if(PyroAdmin) {
          console.log('PyroAdmin exists... Creating instance');
          var pyroAdmin = new PyroAdmin(this);
        }
      }


  };