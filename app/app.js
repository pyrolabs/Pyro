angular.module('pyroApp', ['firebase','ui.router', 'pyroApp.controllers', 'pyroApp.services','ui.ace', 'treeControl','json-tree'])
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
  $sceDelegateProvider.resourceUrlWhitelist(['self', 'https://pyro-server.herokuapp.com/**', 'https://pyro-server/api/fb/**', "https://pyro-test-01.s3.amazonaws.com/**" ]);
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
          templateUrl: 'components/landing/landing-thanks.html',
          controller: 'LandingCtrl'
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
      abstract:true,
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
      .state('editor', {
        parent:'nav',
        url: '/:appId/editor',
        templateUrl:"components/editor/editor-index.html",
        controller: 'EditorCtrl'
      })
      .state('tester', {
        parent:'nav',
        url: '/:appId/tester',
        templateUrl:"components/tester/tester-index.html",
        controller: 'TesterCtrl'
      })
      .state('data', {
        parent:'nav',
        url: '/:appId/data',
        templateUrl:"components/data/data-index.html",
        controller: 'DataCtrl'
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

