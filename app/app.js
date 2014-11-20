angular.module('pyroApp', ['ui.router', 'pyroApp.controllers'])
.constant('FBURL', 'https://pyro.firebaseio.com/')
.run(function($rootScope, FBURL) {
  console.log('Angular is running');
  $rootScope.pyro = new Pyro({url:FBURL});
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){ 
    console.log('route change from:', fromState, ' to: ', toState);
  });

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
    // Load Sidemenu template
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
        url: "/pyro",
        templateUrl:"components/instance/instance-list.html",
        controller: 'InstanceListCtrl'
      })
      
      .state('account', {
        parent:'nav',
        url: "/account",
        templateUrl: "components/session/account/account-index.html",
        controller: 'AccountCtrl'
      })

      // fill sidebar and center(empty view)
      // [TODO] load instance data here only
      .state('instance', {
        parent:'sideNav',
        abstract:true,
        // controller:'InstanceDetailCtrl',
        url:'/pyro/:appId',
        views: {
          'sidemenu':{
            templateUrl:'templates/sidebar.html'
          },
          'center':{
            template:'<ui-view></ui-view>'
          }
        }
      })
    // Tabs
      .state('dash', {
        parent:'instance',
        url: '/dash',
        templateUrl:"components/dash/dash-index.html",
        controller: 'DashCtrl'
      })
      .state('admin', {
        parent:'instance',
        url: '/admin',
        templateUrl:"components/admin/admin-index.html",
        controller: 'AdminCtrl'
      })
    
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');
});

