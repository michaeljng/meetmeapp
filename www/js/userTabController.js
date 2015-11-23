angular.module('meetme.userTabController', [])

.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app.logged-in.user-tab', {
    url: '/user-tab',
    templateUrl: 'templates/user-tab.html',
    abstract: true
  })

  .state('app.logged-in.user-tab.user-detail', {
    url: '/user-detail/:userId',
    templateUrl: 'templates/user-profile.html',
    controller: 'UserController',
    resolve: {
      userData: function($q, $stateParams, ParseService) {
        var dfd = $q.defer();
        ParseService.getById('Users', $stateParams.userId, function(user) {
          dfd.resolve(user);
        });
        return dfd.promise;
      },
      user: function($q, $stateParams, FacebookService, ParseService) {
        var dfd = $q.defer();
        FacebookService.userId(function(facebookId) {
          ParseService.getSingleObject('Users', {"facebookId":facebookId}, function(user) {
            dfd.resolve(user);
          });
        });
        return dfd.promise;
      }
    }
  })

  // Fallback
  $urlRouterProvider.otherwise('/app/home');
})

.controller('UserController', function ($scope, $state, $interval, $stateParams, userData, user, ParseService, FacebookService) {

  $scope.userData = userData;
  $scope.user = user;

  $scope.editable = false;
  $scope.editing = false;

  if ($scope.user.userLocation) {
    var latlon = $scope.user.userLocation.latitude + "," + $scope.user.userLocation.longitude;
    var img_url = "http://maps.googleapis.com/maps/api/staticmap?center="+latlon+"&zoom=14&size=350x300&sensor=false";
    document.getElementById("mapholder").innerHTML = "<img src='"+img_url+"'>";
  }

  if ($scope.user.facebookId == $scope.userData.facebookId) {
    $scope.editable = true;
    $("#editButton").toggle();
  }

  $scope.saveProfile = function() {
    ParseService.update('Users',$scope.user.objectId,$scope.user, function() {
      $scope.reload();
    });
  }
})