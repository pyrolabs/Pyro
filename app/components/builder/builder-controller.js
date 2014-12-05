angular.module('pyroApp.controllers')

.controller('BuilderCtrl', function($scope, $state, $rootScope, $stateParams, PyroArray) {
  console.log('BuilderCtrl');
 
  $rootScope.instanceList = PyroArray('instances');
  $scope.otherDash = function(ind){
    $state.go('dash',{appId:ind})
  }
  $scope.goToDash = function() {
    $state.go('dash',{appId: $stateParams.appId})
  }  
  $scope.goToBuilder = function() {
    $state.go('builder',{appId: $stateParams.appId})
  }
  $scope.goToTester = function() {
    $state.go('tester',{appId: $stateParams.appId})
  }


   $scope.instanceList.$loaded().then(function(pyroList){
      // [TODO] get pyro object by selecting from exisiting list
    $scope.isLoading = false;
    console.log('scope set:', $scope.instanceList[0]);
    $scope.pyroInstance = pyroList[$stateParams.appId]
    $scope.pyroInstance.getUserCount(function(userCount){
      $scope.userCount = userCount;
      if(!$scope.$$phase) {
        //$digest or $apply
        $scope.$apply();
      }
    });
    $scope.pyroInstance.getObjectCount('sessions',function(sessionCount){
      console.log('sessionCount updated:', sessionCount);
      $scope.sessionCount = sessionCount;
       if(!$scope.$$phase) {
        //$digest or $apply
        $scope.$apply();
      }
    });
  });


  $scope.files = {
    'index.html': {
      type: 'file',
      extension: 'html',
      editorMode: 'html',
      content: '<html>\n  <head>\n    <meta charset="utf-8">\n    <meta name="viewport" content="initial-scale=1, maximum-scale=1, user-scalable=no, width=device-width">\n    <title>Pyro App</title>\n    <!-- Ionic CSS -->\n    <link href="lib/ionic/css/ionic.css" rel="stylesheet">\n\n    <!-- ionic/angularjs js -->\n    <script src="lib/ionic/js/ionic.bundle.js"></script>\n    <!-- Firebase Library -->\n    <script src="https://cdn.firebase.com/js/client/2.0.5/firebase.js"></script>\n    <!-- Pyro Library -->\n    <script src="lib/pyro/pyro.js"></script>\n\n    <!-- Pyro Service -->\n    <script src="lib/pyro/pyroService.js"></script>\n\n    <!-- IF using Sass (run gulp sass first), then uncomment below and remove the CSS includes above\n    <link href="css/ionic.app.css" rel="stylesheet">\n    -->\n  </head>\n  <body ng-app="pyroApp" animation="slide-left-right-ios7">\n    <div>\n      <ion-nav-bar class="bar-stable">\n        <ion-nav-back-button class="button-icon icon ion-ios7-arrow-back">Back</ion-nav-back-button>\n      </ion-nav-bar>\n      <ion-nav-view></ion-nav-view>\n    </div>\n    <!-- App Files -->\n    <script src="app.js"></script>\n    <script src="app-controllers.js"></script>\n    <script src="components/home/home-controller.js"></script>\n    <script src="components/session/account/account-controller.js"></script>\n    <script src="components/session/signup/signup-controller.js"></script>\n\n    <script src="components/session/login/login-controller.js"></script>\n  </body>\n</html>'
    },
    'app.js': {
      type: 'file',
      extension: 'js',
      editorMode: 'javascript',
      content: ' // Pyro Starter App\n\n// angular.module is a global place for creating, registering and retrieving Angular modules\n// \'starter\' is the name of this angular module example (also set in a <body> attribute in index.html)\n// the 2nd parameter is an array of \'requires\'\nangular.module(\'pyroApp\', [\'ionic\', \'pyroApp.controllers\'])\n.constant(\'FBURL\', \'ZZ\')\n.run(function($ionicPlatform) {\n  // Use Ionic to setup device defaults\n  $ionicPlatform.ready(function() {\n    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard\n    // for form inputs)\n    if(window.cordova && window.cordova.plugins.Keyboard) {\n      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);\n    }\n    if(window.StatusBar) {\n      // Set the statusbar to use the default style, tweak this to\n      // remove the status bar on iOS or change it to use white instead of dark colors.\n      StatusBar.styleDefault();\n    }\n  });\n})\n.config(function($stateProvider, $urlRouterProvider) {\n\n  // Ionic uses AngularUI Router which uses the concept of states\n  // Learn more here: https://github.com/angular-ui/ui-router\n  // Set up the various states which the app can be in.\n  // Each state\'s controller can be found in controllers.js\n  $stateProvider\n    .state(\'sidemenu\', {\n      abstract:true,\n      templateUrl:\'templates/sidemenu.html\'\n    })\n    .state(\'home\', {\n      parent:\'sidemenu\',\n      url: \'/home\',\n      controller:\'HomeCtrl\',\n      templateUrl: \'components/home/home-index.html\',\n    })\n    .state(\'login\', {\n      url: \'/login\',\n      controller:\'LoginCtrl\',\n      templateUrl: \'components/session/login/login-index.html\'\n    })\n    .state(\'signup\', {\n      url: \'/signup\',\n      controller:\'SignupCtrl\',\n      templateUrl: \'components/session/signup/signup-index.html\'\n    })\n    .state(\'account\', {\n      url: \'/account\',\n      controller:\'AccountCtrl\',\n      templateUrl: \'components/session/account/account-index.html\'\n    })\n    ;\n  // if none of the above states are matched, use this as the fallback\n  $urlRouterProvider.otherwise(\'/login\');\n});\n'
    },
    '/css': {
      type: 'folder',
      'style.css': {
        type: 'file',
        extension: 'js',
        editorMode: 'javascript',
        content: '/* Empty. Add your own CSS if you like */\n\nbody {\n}\n\nh1, h2, h3, h4 {\n  font-weight:100;\n}\n\n.h1-md {\n  font-size:10em;\n}\n\n#content {\n  position:absolute;\n  top:0px; right:0;\n  bottom:0; left:0;\n  padding-top: 81px !important;\n}\n\n#background-header {\n  position:absolute;\n  height: 140px;\n  top:0; right:0;\n  bottom:auto; left:0;\n}\n#background-container {\n  position:absolute;\n  top:0; right:0;\n  bottom:0; left:0;\n}\n#footer{ \n  position: absolute;\n  bottom:0;\n  left:0;\n  right:0;\n}\n\n#content.panel {\n  margin: 118px 72px;\n  height: 440px;\n}\n\n#content.panel .panel-heading {\n  font-size: 1.375em;\n}\n\n#landing {\n  margin: 0;\n  padding: \n}\n/*\n.panel-heading .panel-warning {\n  background-color: \n}*/\n\n#builder {\n  height: 100%;\n}\n\n#build-editor {\n  width: auto;\n  height: 100%;\n}\n\n.ion-icon{ \n  font-size: 1.5em;\n}\n\n.ion-icon-lg{ \n  font-size: 1.5em;\n}\n\n.menu-item {\n  margin: 0.75em 0 0.75em 1em;\n}\n.menu-item.second-item {\n  margin: 0.75em 0 0.75em 0;\n  padding-left: 4.5em !important;\n}\n.navbar-fixed-top {\n  text-align: center;\n  display: block;\n}\n\n.navbar-brand {\n  padding-top: 15px;\n}\n\n.nav .nav-main {\n  margin-left: 10px;\n}\n\n#nav .btn-group {\n  border: none !important;\n  box-shadow: none !important;\n}\n\n.list.card {\n  max-width: 20em !important;\n  margin-right: 1em !important;\n}\n\n.item.item-input {\nborder:none;padding-right:1em;\n}\n\n.item.menu-item,\n.item.menu-item i.main-icon {\n  transition: color 0.3s ease;\n  transition: background-color 0.3s ease;\n}\n.item.menu-item {\n  cursor: pointer;\n}\n.item.menu-item:hover {\n  background-color: auto!important;\n}\n.item.menu-item:hover i.main-icon,\n.item.menu-item.active i.main-icon,\n.item.menu-item.active li.active .second-item:not(i):not(.nonactive) {\n  color: #E64A19 !important;\n}\n.item.menu-item.active .second-item {\n  margin-top: 0;\n  margin-bottom: 0;\n  padding-top: 0.5em;\n  padding-bottom: 0.5em;\n  cursor: pointer;\n  transition: color 0.3s ease;\n}\n\n.item.menu-item.active .second-item:hover {\n  color: #E64A19 !important;\n}\n\n.btn-default.btn-secondary {\n  background-color: #FAFAFA !important;\n}\n.btn-warning.btn-secondary {\n  background-color: #FF9675 !important;\n}\n\n\n.navbar-dark {\n  background-color: #616161 !important;\n}\n.vertical-align {\n  position: relative;\n  top: 50%;\n  transform: translateY(-50%);\n}\n\n\n*,\n*:after,\n*::before {\n  -moz-box-sizing: border-box;\n  box-sizing: border-box;\n}'
      }
    }
  }


  // EDITOR
  loadEditor();
  $scope.dir = {};

  function loadEditor() {
    $scope.editorObj = ace.edit("build-editor");
    $scope.editorObj.on("change", function(){
      saveFileNewContent();
    });
  }
  function saveFileNewContent() {
    if($scope.files.$currentFileKey) {
      console.log("File ",$scope.files.$currentFileKey," changed, saving content.");
      $scope.files[$scope.files.$currentFileKey].newContent = $scope.editorObj.getValue();
    }
  }
  $scope.loadEditorFile = function(filename) {
    setCurrentFile();
    openCurrentFile();
    function setCurrentFile() {
      console.log("Setting editor $currentFileKey to ", $scope.files[filename]);
      $scope.files.$currentFileKey = filename;
    }
    function openCurrentFile(){
      $scope.editorObj.getSession().setMode('ace/mode/'+$scope.files[$scope.files.$currentFileKey].editorMode);
      if($scope.files[$scope.files.$currentFileKey].newContent) {
        $scope.editorObj.getSession().setValue($scope.files[$scope.files.$currentFileKey].newContent)
      } else {
        $scope.editorObj.getSession().setValue($scope.files[$scope.files.$currentFileKey].content)
      }
      $scope.editorObj.clearSelection();
    }
  }


  
})