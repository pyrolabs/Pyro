// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('pyroApp', ['ui.router', 'pyroApp.controllers'])
.constant('FBURL', 'https://pyro.firebaseio.com/')
.run(function($rootScope) {
  console.log('Angular is running');
  $rootScope.pyro = new Pyro();
})
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('login', {
      url: '/login',
      views:{
        'main':{
          templateUrl: 'components/session/login/login-index.html',
          controller: 'LoginCtrl'
        }
      }
    })
    .state('signup', {
      url: '/signup',
      views:{
        'main':{
          templateUrl: 'components/session/account/account-new.html',
          controller: 'SignupCtrl'
        }
      }
    })
    .state('nav', {
      abstract:true,
      views: {
        'main':{
          template:'<ui-view></ui-view>'
        },
        'navbar': {
          templateUrl:"templates/nav-bar.html"
        }
      }
    })
    .state('sideNav', {
      parent:'nav',
      templateUrl: "templates/side-menu.html",
      abstract:true
    })
    .state('sidemenu', {
      parent:'sideNav',
      abstract:true,
      views: {
        'sidemenu':{
          templateUrl:'templates/sidebar.html'
        },
        'center':{
          template:'<ui-view></ui-view>'
        }
      }
    })
    .state('home', {
      parent:'nav',
      url: "/home",
      templateUrl:"components/instance/instance-list.html",
      controller: 'InstanceListCtrl'
    })
    .state('dash', {
      parent:'sidemenu',
      url: '/:appId',
      templateUrl:"components/instance/instance-index.html",
      controller: 'InstanceDetailCtrl'
    })
    .state('account', {
      parent:'nav',
      url: "/account",
      templateUrl: "components/session/account/account-index.html",
      controller: 'AccountCtrl'
    })
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});

