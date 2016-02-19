angular.module('meetme.userTabController', [])

.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app.logged-in.user-tab', {
    url: '/user-tab',
    templateUrl: 'templates/user-tab.html',
    abstract: true
  })

  .state('app.logged-in.user-tab.user-detail', {
    url: '/user-detail/:displayUserId',
    templateUrl: 'templates/user-profile.html',
    controller: 'UserController',
    resolve: {
      displayUser: function(PreloadFunctions, $stateParams) {
        return PreloadFunctions.userById($stateParams.displayUserId);
      }
    }
  })

  // Fallback
  $urlRouterProvider.otherwise('/app/home');
})

.controller('UserController', function ($scope, $state, $interval, $timeout, displayUser, ParseService, PubNubService, FacebookService, LocationService) {

  $scope.displayUser = displayUser;

  $scope.editable = false;
  $scope.editing = false;
  $scope.inviteDisabled = false;

  if ($scope.displayUser.userLocation) {
    var latlon = $scope.displayUser.userLocation.latitude + "," + $scope.displayUser.userLocation.longitude;
    var img_url = "http://maps.googleapis.com/maps/api/staticmap?center="+latlon+"&zoom=14&size=350x300&sensor=false";
    // document.getElementById("mapholder").innerHTML = "<img src='"+img_url+"'>";
  }

  if ($scope.currentUser.objectId == $scope.displayUser.objectId) {
    $scope.editable = true;
    $("#editButton").show();
    // Hide the distance
    $("#distanceFrom").hide();
  } else {
    // Calculate distance between the current user and the display user

    if ($scope.currentUser.userLocation != null && $scope.displayUser.userLocation != null) {
      var distance = LocationService.milesBetween($scope.currentUser.userLocation.latitude, $scope.currentUser.userLocation.longitude,
                                                $scope.displayUser.userLocation.latitude, $scope.displayUser.userLocation.longitude);

      // Remove decimals
      distance = distance.toFixed(1);

      $("#distance").html(distance);
      $("#option-notification").show();
    }
    else {
      $("#distance").html("unknown");
    }
  }

  $scope.saveProfile = function() {
    ParseService.updateAndRetrieve('Users',$scope.currentUser.objectId,$scope.displayUser, function(user) {
      $scope.displayUser = user;
    });
    $('#saved-notification').show();
    $timeout(function() { $('#saved-notification').fadeOut('2000'); }, 2000);
  }

  $scope.sendInvitation = function(user) {
    $scope.$parent.$parent.isInviting = true;
    $scope.$parent.$parent.interactingWithUser = user;
    PubNubService.sendNotificationToChannel(user.objectId, $scope.currentUser, "Invitation Received", {});
    $scope.inviteDisabled = true;
    $('#option-notification').find('.invite-button').html('Invitation sent!');
    $('#option-notification').find('.invite-button').removeClass('button-calm').addClass('button-stable');
  }
})