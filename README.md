#Pyro for Firebase

Pyro is a platform that allows simple setup of standard app features on top of Firebase.

Pyro consits of two parts:
* Pyro.js - Extended version of firebase.js library that will be implemented on your clients or admin pannels. This handles storing user account and session data in an organized manor, which makes analytics much easier.
* Pyro Platform - Pyro module control and admin account management. Accessible by copying this repo onto hosting or by logging into the [Pyro Pannel](http://pryolabs.us)


##Using Pyro Library
In order to use the Pyro library you will have to include the following files in your HTML:
```html
<!-- Firebase -->
<script src="https://cdn.firebase.com/js/client/2.0.4/firebase.js"></script>

<!-- Pryo -->
<script src="dist/pyro.js"></script>

```


Note:
In order to create custom auth objects you will need to visit [Pyro Platform](http://pryolabs.us) to create an account. You will signup with an email an password then provide your firebase master key. Also, you will have to copy the corresponding rules to your firebase instance.

###API Reference
Pyro works just like the [Firebase API](https://www.firebase.com/docs/web/api/) and actually includes access to all main firebase functions as well as added functionality. 

* Construct new Pyro instance on a Firebase instance: 
    `var pyro = new Pyro(firebaseUrl);`
* Access Unmodified Firebase API functions:
    `pyro.mainRef();`
* Create New User, store new user account data, and setup presense/session for client:
    ```
    //pyro.signup(argSignupData, successCb, errorCb)
    pyro.signup(
        {email:userEmail, password:userPassword}, 
        function(userAccountRef){}, 
        function(error){}
    );
    ```
* Login device with password and setup presense/session for client:
    `pyro.login(argSignupData, successCb, errorCb)`

##Pyro Project Planning

###Current Modules

* Pyro Platform - User Administration/Analytics

###Future Modules
* Pyro Push - Push notifications based on firebase data events
* Pyro Analytics - Crunch data on your firebase application
* Pyro Integrations - Custom plugin interface

###Dependencies
Pyro Library:
[Firebase Web Platform](https://www.firebase.com/docs/web/)

Pyro Platform:
[Angularjs](http://angularjs.org)

[Ionic Framework](http://ionicframework.com)
