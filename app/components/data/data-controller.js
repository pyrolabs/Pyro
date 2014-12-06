angular.module('pyroApp.controllers')

.controller('DataCtrl', function($scope, $state, $rootScope, $stateParams, PyroArray, $window) {
  console.log('DataCtrl');
  $rootScope.instanceList = PyroArray('instances');
  $scope.otherDash = function(ind) {
    $state.go('dash', {
      appId: ind
    })
  }
  $scope.goToDash = function() {
    $state.go('dash', {
      appId: $stateParams.appId
    })
  }
  $scope.goToBuilder = function() {
    $state.go('builder', {
      appId: $stateParams.appId
    })
  }
  $scope.goToTester = function() {
    $state.go('tester', {
      appId: $stateParams.appId
    })
  }
  $scope.goToData = function() {
    $state.go('data', {
      appId: $stateParams.appId
    })
  }


  $scope.instanceList.$loaded().then(function(pyroList) {
    // [TODO] get pyro object by selecting from exisiting list
    $scope.isLoading = false;
    console.log('scope set:', $scope.instanceList[0]);
    $scope.pyroInstance = pyroList[$stateParams.appId];
  });

  $scope.jsonData = {
    "pyro-test-05": {
      "messages": {
        "-JaYb_M70aiWE4f19-wf": {
          "content": "asdfasdf",
          "createdAt": 1415789303377
        },
        "-JaYbcFMwVGLEPQ7v7-4": {
          "content": "asdfasdf",
          "createdAt": 1415789315233
        },
        "-JaYbcVqrjBYUW12VeLr": {
          "content": "asdfasdf",
          "createdAt": 1415789316288
        },
        "-JaYbcn7oBQkInWWNAc5": {
          "content": "asdfasdf",
          "createdAt": 1415789317458
        },
        "-JaYcTgZ2m2ucHOWeSck": {
          "content": "asdfasdf",
          "createdAt": 1415789538086
        },
        "-JaYh61RiTF07tgLE1rw": {
          "author": "prescottprue@gmail.com",
          "content": "New message",
          "createdAt": 1415790751882
        },
        "-JaYhW-2Bp4TVpcegTmJ": {
          "author": "prescottprue@gmail.com",
          "content": "asdfasdfasdfasdfasdf",
          "createdAt": 1415790859578
        }
      },
      "userArray": "[{1:'user1'}]",
      "users": {
        "-JaYSUGyYFCRrktERCja": {
          ".priority": "prescottprue@gmail.com",
          "createdAt": 1415786656883,
          "email": "prescottprue@gmail.com",
          "role": 10
        }
      }
    }
  }

})