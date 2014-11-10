/* PyroAdmin - Administration/Analytics pannel for Firebase*/

    function PyroAdmin (argPyro) {
			if(Firebase) {
		    console.log('New PyroAdmin');
        //add pyroAdmin to list of modules with basic settings
			}
			else {
				var err = 'Incorrect parameters for new PyroAdmin';
				console.error(err);
				throw new TypeError(err);
			}
    }

    PyroAdmin.prototype = {
        getInfo:function(){},
        test: function() {}

    };