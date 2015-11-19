// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('meetme', ['ionic',
  'ngCordova',
  'ionic.service.core',
  'ionic.service.push', 
  'meetme.controllers', 
  'meetme.services', 
  'meetme.userController', 
  'meetme.searchTabController', 
  'ngOpenFB'])



  .config(['$ionicAppProvider', function($ionicAppProvider) {
    $ionicAppProvider.identify({
      app_id: '6db3367a',
      api_key: 'c155dc86fcdf2dd071b86943d69f01429d2f0d0bcf62b8cb',
      dev_push: true
    })
  }])

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

.controller('LoginController', function ($scope, $state, $ionicUser, $ionicPush, $rootScope, FacebookService, ParseService) {

  $scope.userId;

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
              console.log( $scope.userId);
              $scope.identifyUser($scope.userId);
              $scope.pushRegister();
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

$scope.identifyUser = function(userId) {
 var user = $ionicUser.get();
 if(!user.user_id) {
   // Set your user_id here, or generate a random one.
   user.user_id = userId
   
   // // Metadata
   // angular.extend(user, {
   // name: 'Simon',
   // bio: 'Author of Devdactic'
   // });

   // Identify your user with the Ionic User Service
   $ionicUser.identify(user).then(function(){
    $scope.identified = true;
    console.log('Identified user ' + user.name + '\n ID ' + user.user_id);
  });
 }
}

 $scope.pushRegister = function() {
   console.log('Ionic Push: Registering user');
   
   // Register with the Ionic Push service.  All parameters are optional.
   $ionicPush.register({
     canShowAlert: true, //Can pushes show an alert on your screen?
     canSetBadge: true, //Can pushes update app icon badges?
     canPlaySound: true, //Can notifications play a sound?
     canRunActionsOnWake: true, //Can run actions outside the app,
     onNotification: function(notification) {
       // Handle new push notifications here

       // console.log(JSON.stringify(notification,null,'\t'));

       return true;
     }
   });
 }

 $rootScope.$on('$cordovaPush:tokenReceived', function(event, data) {
    ParseService.update('Users', $scope.userId, {"pushToken":data.token}, function(response) {
      console.log('Ionic Push: Saved token ', data.token, data.platform);
    });
  });
})
