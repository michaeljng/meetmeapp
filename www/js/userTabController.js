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
    controller: 'UserTabController'
  })

  // Fallback
  $urlRouterProvider.otherwise('/app/home');
})

.controller('UserTabController', function ($scope, $state, $interval, $stateParams, ParseService, FacebookService) {

  $scope.user = null;
  $scope.post = null;

  $scope.editable = false;
  $scope.editing = false;

  $scope.reload = function() {
    ParseService.getById('Users', $stateParams.userId, function(user) {

      $scope.user = user;

      if ($scope.user.userLocation) {
        var latlon = $scope.user.userLocation.latitude + "," + $scope.user.userLocation.longitude;
        var img_url = "http://maps.googleapis.com/maps/api/staticmap?center="+latlon+"&zoom=14&size=350x300&sensor=false";

        document.getElementById("mapholder").innerHTML = "<img src='"+img_url+"'>";
      }

      FacebookService.userId(function(userId) {
        if (userId == $scope.user.facebookId) {
          $scope.editable = true;
          $("#editButton").toggle();
        }
      });
    });

  }

  $scope.reload();

  $interval(function() {
    $scope.reload();
  }, 20000);

  $scope.saveProfile = function() {
    ParseService.update('Users',$scope.user.objectId,$scope.user, function() {
      $scope.reload();
    });
  }
})