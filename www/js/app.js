// Ionic Starter App

//Non-ionic functions
//IS THERE A BETTER PLACE FOR THESE?
var showLogin = function(){
  document.getElementById("fb-login-instructions").className += " open";
  document.getElementById("login-overlay").className += " open";
}
var hideLogin = function(){
  document.getElementById("fb-login-instructions").className -= " open";
  document.getElementById("login-overlay").className = "overlay";
}

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('meetme', ['ionic',
  'ngCordova',
  'angularUUID2',
  'meetme.controllers',
  'meetme.services',
  'meetme.searchTabController',
  'meetme.userTabController',
  'meetme.chatTabController',
  'ngOpenFB'])

  // .run(function($ionicPlatform) {
  //   $ionicPlatform.ready(function() {
  //     var push = new Ionic.Push({
  //       "debug": true
  //     });

  //     push.register(function(token) {
  //       console.log("Device token:",token.token);
  //     });
  //     // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
  //     // for form inputs)
  //     // if(window.cordova && window.cordova.plugins.Keyboard) {
  //     //   cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
  //     // }
  //     // if(window.StatusBar) {
  //     //   StatusBar.styleDefault();
  //     // }
  //   });
  // })

.config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

        .state('app', {
          url: '/app',
          templateUrl: 'templates/app.html',
          controller: 'ApplicationController',
        })

        .state('app.logged-out', {
          url: '/home',
          templateUrl: 'templates/logged-out.html',
          controller: 'LoginController'
        })

        .state('app.logged-in', {
          url: '/logged-in',
          templateUrl: 'templates/logged-in.html',
          controller: 'MainController',
          resolve: {
            currentUser: function(PreloadFunctions) {
              return PreloadFunctions.currentUser();
            }
          }
        })

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/home');

      })


// iOS style bottom nav for both platforms.
.config(function($ionicConfigProvider) {
  $ionicConfigProvider.tabs.position("bottom");
  $ionicConfigProvider.tabs.style("standard");
})


.controller('ApplicationController', function ($scope, $interval) {

  $scope.applicationName = 'QuiikMeet'
  $scope.availableSecondsLeft = 0;
  $scope.timer = null;
  $scope.headerText = "";
  $scope.showLogo = true;
  $scope.showBack = false;
  $scope.backBlock = null;

  $scope.clearTimer = function() {
    $interval.cancel($scope.timer);
    $scope.timer = null;
  }

  $scope.setAvailableTimer = function(seconds) {
    if ($scope.timer != null) {
      $scope.clearTimer();
    }

    $scope.showLogo = false;
    $scope.availableSecondsLeft = seconds;

    $scope.timer = $interval(function(){
        var minutesLeft = Math.ceil($scope.availableSecondsLeft/60);

        if (minutesLeft > 59) {
          $scope.headerText = Math.ceil(minutesLeft/60) + " Hours Left";
        }
        else if (minutesLeft > 1) {
          $scope.headerText = minutesLeft + " Minutes Left";
        }
        else {
          $scope.headerText = $scope.availableSecondsLeft + " Seconds Left";
        }

        if ($scope.availableSecondsLeft == 0) {
          $scope.showTitle();
        } else {
          $scope.availableSecondsLeft -= 1;
        }
      }, 1000);
  }

  $scope.showTitle = function() {
    $scope.headerText = "";
    $scope.showLogo = true;
    $scope.clearTimer();
  }

  $scope.showBackButton = function(args,block) {
    $scope.backBlock = function () {
       block.apply(this,args);
    }
    $scope.showBack = true;
  }

  $scope.hideBackButton = function() {
    $scope.backBlock = null;
    $scope.showBack = false;
  }

  $scope.back = function() {
    $scope.backBlock();
    $scope.hideBackButton();
  }

  $scope.showTitle();
})

.controller('LoginController', function ($scope, $state, FacebookService, ParseService) {

  $scope.userId;

  $scope.inviterId = null;

  $scope.$on('$routeChangeSuccess', function () {
    FacebookService.loginStatus(function(status){
      if (status == 'connected') {
        $state.go('app.logged-in.search-tab.unavailable');
      }
    });
  });


  $scope.doLogin = function() {
    FacebookService.login(function(response) {
      if (response.status === 'connected') {

        FacebookService.getUserFields(['id','name'],function(user) {
          ParseService.get('Users', {"facebookId":user.id}, function(results) {

            var finishLogin = function() {
              $state.go('app.logged-in.search-tab.unavailable', {"userId": $scope.userId});
            }

            if (results.length == 0) {
              ParseService.create('Users', {"facebookId":user.id,"facebookName":user.name}, function(response) {
                $scope.userId = response.data.objectId;
                finishLogin();
              });
            }
            else {
              results[0].facebookId = user.id;
              results[0].facebookName = user.name;

              ParseService.update('Users', results[0].objectId, results[0], function(response) {
                $scope.userId = response.config.data.objectId;
                finishLogin();
              });
            }

          });
        });
      } else {
        alert('Facebook login failed');
      }
    })
  }

})