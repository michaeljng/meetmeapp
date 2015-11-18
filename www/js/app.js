// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('meetme', ['ionic',
                          'meetme.controllers',
                          'meetme.services',
                          'meetme.userController',
                          'meetme.searchTabController',
                          'meetme.userTabController',
                          'ngOpenFB'])

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

        .state('app', {
          url: '/app',
          templateUrl: 'templates/app.html',
          abstract: true
        })

        .state('app.logged-out', {
          url: '/home',
          templateUrl: 'templates/logged-out.html',
          controller: 'LoginController'
        })

        .state('app.logged-in', {
          url: '/logged-in',
          templateUrl: 'templates/logged-in.html',
          controller: 'MainController'
        })

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/app/home');

      })

.controller('LoginController', function ($scope, $state, FacebookService, ParseService) {

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

            var changeState = function(userId) {
              console.log(userId);
              $state.go('app.logged-in.search-tab.unavailable', {"userId":userId});
            }

            if (results.length == 0) {
              ParseService.create('Users', {"facebookId":user.id,"facebookName":user.name}, function(response) {
                changeState(response.data.objectId);
              });
            }
            else {
              results[0].facebookId = user.id;
              results[0].facebookName = user.name;

              ParseService.update('Users', results[0].objectId, results[0], function(response) {
                changeState(response.config.data.objectId);
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
