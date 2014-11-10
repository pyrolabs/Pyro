/* Pyro for Firebase*/
window.pyro = (function (Firebase) {
  console.log('Firebase', firebase);
	//Save previous value of pyroAdmin
	var previousPyro = window.pyro;
	
  function Pyro (argPyroData) {
    //Check for existance of Firebase
    if(Firebase) {
      if(argPyroData.hasOwnProperty('url') && argPyroData.hasOwnProperty('secret')){
        console.log('New Pyro created:', arguments);
        this.url = argPyroData.url;
        this.secret = argPyroData.secret;
        this.secret = argPyroData.secret;
        //create admin account using provided email
        if(argLoginData) {

        }
        //Login to firebase
        this.mainRef = new Firebase(this.url);
        this.mainRef.authWithPassword()
      }
      else throw Error('Incorrect Pyro Object Format');
    }
    else throw Error('Firebase library does not exist. Check that firebase.js is included in your index.html file.');

  }
   
  var pyro = {
      createInstance: function (argUrl) {
      	//Check for existance of
       	console.log('createInstance called');
       	return new PyroAdmin(argUrl);
      },
      getInfo: function() {
        console.log('getInfo called:');
        return previousPyro;
      },
      addModule: function() {
        console.log('addModule called');
        //add module instance to pyro
      }

  };
     
  return pyro;
}());