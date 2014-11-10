/* PyroAdmin - Administration/Analytics pannel for Firebase*/
window.pyro = (function (Firebase) {
  console.log('Firebase', firebase);
	//Save previous value of pyroAdmin
	var previousPyro = window.pyro;
	
  function Pyro (argPyroData) {
    console.log('New Pyro created:', arguments);
    this.url = argPyroData.url;
    this.secret = argPyroData.secret;
    //use email from auth token
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