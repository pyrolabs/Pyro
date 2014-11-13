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
          templateUrl: "templates/side-menu.html",
          controller: 'InstanceListCtrl'
        },
        'navbar': {
          templateUrl:"templates/nav-bar.html"
        }
      }
    })
    .state('home', {
      parent:'nav',
      url: "/home",
      views: {
        'sidemenu' :{
          templateUrl: "components/dash/dash-index.html",
          controller: 'InstanceListCtrl'
        },
        'center': {
          templateUrl:"components/dash/dash-home.html",
          controller: 'InstanceListCtrl'
        }
      }
    })
    // .state('home', {
    //   parent:'menu',
    //   url: "/home",
    //   views: {
    //     'menuContent' :{
    //       templateUrl: "components/instance/instance-list.html",
    //       controller: 'InstanceListCtrl'
    //     },
    //     'sideMenu': {
    //       templateUrl:"components/instance/instance-list-sidemenu.html"
    //     }
    //   }
    // })
    .state('instance-list', {
      parent:'menu',
      url: "/apps",
      views: {
        'menuContent' :{
          templateUrl: "components/instance/instance-list.html",
          controller: 'InstanceListCtrl'
        },
        'sideMenu': {
          templateUrl:"components/instance/instance-list-sidemenu.html"
        }
      }
    })
    .state('instance-detail', {
      parent:'menu',
      url: "/apps/:appId",
      views: {
        'menuContent' :{
          templateUrl: "components/instance/instance-detail.html",
          controller: 'InstanceDetailCtrl'
        },
        'sideMenu': {
          templateUrl:"components/instance/instance-detail-sidemenu.html"
        }
      }
    })
    .state('account', {
      parent:'menu',
      url: "/account",
      views: {
        'menuContent' :{
          templateUrl: "components/session/account/account-index.html",
          controller: 'AccountCtrl'
        },
        'sideMenu': {
          templateUrl:"components/instance/instance-list-sidemenu.html"
        }
      }
    })
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});

