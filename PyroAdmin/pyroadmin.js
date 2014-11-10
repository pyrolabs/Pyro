/* PyroAdmin - Administration/Analytics pannel for Firebase*/
window.pyroAdmin = (function () {

		//Save previous value of pyroAdmin
		var previousPyroAdmin = window.pyroAdmin;

    function PyroAdmin (argPyroData) {
			if(Firebase && argPyroData.hasOwnProperty('url') && argPyroData.hasOwnProperty('secret')) {
				console.log('Firebase exists:', Firebase);
		    console.log('PyroAdmin called');
	      this.url = argPyroData.url;
	      this.secret = argPyroData.secret;

			}
			else {
				var err = 'Incorrect parameters for new PyroAdmin';
				console.error(err);
				throw new TypeError(err);
			}
    }

     
    var pyroAdmin = {
        createInstance: function (argPyroData) {
        	//Check for existance of
         	console.log('createInstance called');
          
         	return new PyroAdmin(argPyroData);
        },
        addToPyro:function(argPyro) {

        },

        getInfo:function(){},
        test: function() {}

    };
     
    return pyroAdmin;
}());