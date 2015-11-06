// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('meetme', ['ionic', 'meetme.controllers', 'meetme.services', 'ngOpenFB'])

  // .run(function($ionicPlatform) {
  //   $ionicPlatform.ready(function() {
  //     // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
  //     // for form inputs)
  //     if(window.cordova && window.cordova.plugins.Keyboard) {
  //       cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
  //     }
  //     if(window.StatusBar) {
  //       StatusBar.styleDefault();
  //     }
  //   });
  // })

.config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

        .state('logged-out', {
          url: '/home',
          templateUrl: 'templates/logged-out.html',
          controller: 'LoginController'
        })

        .state('logged-in', {
          url: '/logged-in/:userId',
          templateUrl: 'templates/logged-in.html',
          controller: 'MainController'
        })

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/home');

      })

.controller('LoginController', function ($scope, $state, FacebookService, ParseService) {

  if (FacebookService.loginStatus() == 'connected') {
    $state.go('logged-in');
  }

  $scope.doLogin = function() {
    FacebookService.login(function(response) {
      if (response.status === 'connected') {

        FacebookService.userId(function(id) {
          ParseService.get('Users', {"facebookId":id}, function(results) { 

            if (results.length == 0) {
              ParseService.create('Users', {"facebookId":user.id})
            }

            $state.go('logged-in');
          });
        });
      } else {
        alert('Facebook login failed');
      }
    })
  }
  })
