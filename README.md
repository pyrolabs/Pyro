# Pyro Platform

Pyro is a platform that allows simple setup of standard app features on top of Firebase.

Pyro consits of multiple parts:
* [Pyro.js](https://github.com/pyrolabs/PyroLibrary) - Extended version of firebase.js library that will be implemented on your clients or admin pannels. This handles storing user account and session data in an organized manor, which makes querying and analytics much easier.
* Pyro Platform - Pyro module control and admin account management. Accessible by copying this repo onto hosting or by logging into the [Pyro Platform](http://pryolabs.io)
* Pyro Server - Node.js server that runs background tasks for Pyro
* Pyro Seed - Example/Seed app that is generated for users with their preferences when creating a new app.

## Pyro Project Planning

### Current Modules

* Pyro Platform - App creation/ management

### Future Modules
* Pyro Push - Push notifications based on firebase data events
* Pyro Analytics - Crunch data on your firebase application
* Pyro Integrations - Custom plugin interface

### Dependencies
* [Ionic Framework](http://ionicframework.com)
* [Angularjs](http://angularjs.org)
* [ui-router](http://angular-ui.github.io/ui-router/site/#/api/ui.router) -- [Docs](https://github.com/angular-ui/ui-router/wiki)
