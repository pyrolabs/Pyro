angular.module('pyroApp', ['firebase','ui.router', 'pyroApp.controllers', 'pyroApp.services', 'pyroApp.config','ui.ace', 'treeControl'])
.run(function($rootScope, $window, $location, version, SERVERURL) {
  console.log('Pyro is running version: ' + version + ' with a serverurl: ' + SERVERURL);
  $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams){ 
    console.log('route change from:', fromState, ' to: ', toState);
    $rootScope.currentState = toState;
  });
  $rootScope.$on('$stateChangeSuccess',
    function(event){
      if (!$window.ga)
        return;
      $window.ga('send', 'pageview', { page: $location.path() });
  });
})
// Whitelist Urls
.config(['$sceDelegateProvider', 'SERVERURL', function($sceDelegateProvider, SERVERURL){
  $sceDelegateProvider.resourceUrlWhitelist(['self', SERVERURL + '**' ]);
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
        "auth":["pyroMaster", function(pyroMaster){
          return pyroMaster.$auth.$waitForAuth();
        }],
        "user":["pyroMaster", function(pyroMaster){
          return pyroMaster.$getUser();
        }]
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
        url: "/home",
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
        url:'/:appId',
        abstract:true,
        controller: 'InstanceListCtrl',
        resolve:{
          instanceData:function(PyroArray, $q, $stateParams){
            var deferred = $q.defer();
            var instanceList = PyroArray('instances');
            instanceList.$loaded().then(function(pyroList) {
              var pyroData = instanceList.$getRecord($stateParams.appId);
              var appFb = new Firebase(pyroData.dbUrl);
              appFb.once('value', function(pyroSnap){
                deferred.resolve(pyroSnap.val());
              });
            });
            return deferred.promise;
          },
          instance:function(pyroMaster, $stateParams, $q, pyro){
            var deferred = $q.defer()
            pyroMaster.$loadObject('instances', $stateParams.appId).then(function(returnedInstance){
              var pyroObj = pyro(returnedInstance);
              deferred.resolve(pyroObj);
            })
            return deferred.promise;
          }
        },
        template:'<ui-view></ui-view>'
        // views: {
        //   'sidemenu':{
        //     templateUrl:'templates/sidebar.html'
        //   },
        //   'center':{
        //     template:'<ui-view></ui-view>'
        //   }
        // }
      })
    // Tabs
      .state('dash', {
        parent:'instance',
        url: '/dash',
        templateUrl:"components/dash/dash-index.html",
        controller: 'DashCtrl'
      })
      .state('editor', {
        parent:'instance',
        url: '/editor',
        templateUrl:"components/editor/editor-index.html",
        controller: 'EditorCtrl'
      })
      .state('tester', {
        parent:'instance',
        url: '/tester',
        templateUrl:"components/tester/tester-index.html",
        controller: 'TesterCtrl'
      })
      .state('data', {
        parent:'instance',
        url: '/data',
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

