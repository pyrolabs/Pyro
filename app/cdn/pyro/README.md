#Pyro Library for Firebase

Pyro is a platform that allows simple setup of standard app features on top of Firebase.

Pyro Library (pyro.js) is an extended version of the firebase.js library. Pyro includes functionality for storing user account and session data in an organized manor, which makes querying and analytics much easier.


##Using Pyro Library
In order to use the Pyro library you will have to include the following files in your HTML:
```html
<!-- Firebase -->
<script src="https://cdn.firebase.com/js/client/2.0.4/firebase.js"></script>

<!-- Pryo -->
<script src="https://pyro.firebaseio.com/cdn/pyro.js"></script>

```


Note:
In order to create custom auth objects you will need to visit [Pyro Platform](http://pryolabs.us) to create an account. You will signup with an email an password then provide your firebase master key. Also, you will have to copy the corresponding rules to your firebase instance.

###API Reference
Pyro works just like the [Firebase API](https://www.firebase.com/docs/web/api/) and actually includes access to all main firebase functions as well as added functionality.

####Initialize 
* Construct new Pyro instance on a Firebase instance: 
    
```JavaScript
    var pyro = new Pyro({url:"firebaseUrl"});
```

####Firebase Functionality

* Access Unmodified [Firebase API functions](https://www.firebase.com/docs/web/api/):
    
    `pyro.mainRef();`

####Pyro Functionality    

**Create User**

Creating a New User through pyro also sets up a profile, and setup presense/session for that user.

```JavaScript
    //pyro.signup(argSignupData, successCb, errorCb)
    pyro.userSignup({
        email:userEmail, 
        password:userPassword
        }, 
        function(userAccountRef){
            console.log('New user created:', userAccountRef.val());
        }, 
        function(error){
            console.error('Error creating new user:', error);
        }
    );
```

Note: Any parameters other than email and password in signupData will also be saved with the account (role parameter for example).

**Log In**

Log In enables presense and session management for client as well as setting auth just as firebase library does:

```JavaScript
    //pyro.login(argSignupData, successCb, errorCb)
    pyro.login({})
```


**Check User**

To check current user information at any time:
```JavaScript
    //Auth information
    pyro.getAuth()

    //Account/Profile information
    pryo.getProfile()
```



####Planned
* User Data (User Count, Online User list) - Analytics availible on [Pyro Platform](https://pyro.firebaseio.com/)
* Role management (Moderators, Admins, Users, Anonymous)


###Dependencies

Pyro Library:

[Firebase Web Platform](https://www.firebase.com/docs/web/)

Pyro Platform:

* [Angularjs](http://angularjs.org)

* [Ionic Framework](http://ionicframework.com)

##Contact
If you have any questions please feel free to contact us
