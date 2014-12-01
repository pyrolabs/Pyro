angular.module('pyroApp', ['firebase','ui.router', 'pyroApp.controllers', 'pyroApp.services','ui.ace' ])
.constant('FBURL', 'https://pruvit.firebaseio.com/')
.run(function($rootScope, FBURL, $window, $location) {
  console.log('Angular is running');
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){ 
    console.log('route change from:', fromState, ' to: ', toState);
  });

     $rootScope
        .$on('$stateChangeSuccess',
          function(event){
            if (!$window.ga)
              return;
            $window.ga('send', 'pageview', { page: $location.path() });
        });

})
.config(['$sceDelegateProvider', function($sceDelegateProvider){
  $sceDelegateProvider.resourceUrlWhitelist(['self', 'https://pyro-server.herokuapp.com/**', 'http://localhost:4000']);
}])
.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('landing', {
      url: '/',
      views:{
        'main':{
          templateUrl: 'components/landing/landing-index.html',
          controller: 'LandingCtrl'
        }
      }
    })
    .state('betaThanks', {
      url: '/betaThanks',
      views:{
        'main':{
          templateUrl: 'components/landing/landing-thanks.html'
        }
      }
    })
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
      resolve:{
        auth: function(pyroMaster){
          return pyroMaster.$auth();
        },
        user:function(pyroMaster){
          return pyroMaster.$getUser();
        }
      },
      views: {
        'main':{
          template:'<ui-view></ui-view>'
        },
        'navbar': {
          templateUrl:"templates/nav-bar.html"
        }
      }
    })
    // // Load Sidemenu template
    // .state('sideNav', {
    //   parent:'nav',
    //   templateUrl: "templates/side-menu.html",
    //   abstract:true
    // })
    //   .state('sidemenu', {
    //     parent:'sideNav',
    //     abstract:true,
    //     views: {
    //       'sidemenu':{
    //         templateUrl:'templates/sidebar.html'
    //       },
    //       'center':{
    //         template:'<ui-view></ui-view>'
    //       }
    //     }
    //   })
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
        parent:'nav',
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
        parent:'nav',
        url: '/:appId/dash',
        templateUrl:"components/dash/dash-index.html",
        controller: 'DashCtrl'
      })
      .state('builder', {
        parent:'nav',
        url: '/:appId/builder',
        templateUrl:"components/builder/builder-index.html",
        controller: 'BuilderCtrl'
      })
      .state('tester', {
        parent:'nav',
        url: '/:appId/tester',
        templateUrl:"components/tester/tester-index.html",
        controller: 'TesterCtrl'
      })

      .state('admin', {
        parent:'instance',
        url: '/admin',
        templateUrl:"components/admin/admin-index.html",
        controller: 'AdminCtrl'
      })
    
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/');
});

