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

.controller('UserController', function ($scope, $state, $interval, $timeout, $ionicPopup, displayUser, ParseService, PubNubService, FacebookService, LocationService) {

  $scope.displayUser = displayUser;

  $scope.editable = false;
  $scope.editing = false;
  $scope.inviteEnabled = true;

  var inviteButtonTextDefault = "Invite to meet up!";
  var inviteButtonTextInvited = 'Invitation sent!';

  $scope.inviteButtonText = inviteButtonTextDefault;

  $scope.$on('invitationDeclined', function(eventName, args) {
    $scope.setInviteButtonAvailable(true);
  });

  if ($scope.displayUser.userLocation) {
    var latlon = $scope.displayUser.userLocation.latitude + "," + $scope.displayUser.userLocation.longitude;
    var img_url = "http://maps.googleapis.com/maps/api/staticmap?center="+latlon+"&zoom=14&size=350x300&sensor=false";
    // document.getElementById("mapholder").innerHTML = "<img src='"+img_url+"'>";
  }

  if ($scope.currentUser.objectId == $scope.displayUser.objectId) {
    $scope.editable = true;
    $scope.$parent.$parent.$parent.hideBackButton();
  } else {
    // Calculate distance between the current user and the display user
    if ($scope.currentUser.userLocation != null && $scope.displayUser.userLocation != null) {
      var distance = LocationService.milesBetween($scope.currentUser.userLocation.latitude, $scope.currentUser.userLocation.longitude,
                                                $scope.displayUser.userLocation.latitude, $scope.displayUser.userLocation.longitude);

      // Remove decimals
      distance = distance.toFixed(1);

      $("#distance").html(distance);
    }
    else {
      $("#distance").html("unknown");
    }
  }

  if($scope.editable != true) {
    if($scope.displayUser.nickName == null) {
      $scope.displayUser.nickName = "N/A"
    }
    if($scope.displayUser.userAge == null) {
      $scope.displayUser.userAge = "N/A"
    }
    if($scope.displayUser.userDescription == null) {
      $scope.displayUser.userDescription = "N/A"
    }
  }

  $scope.setInviteButtonAvailable = function(bool) {
    if (bool) {
      $scope.inviteEnabled = true;
      $scope.inviteButtonText = inviteButtonTextDefault;
      $('#option-notification').find('.invite-button').removeClass('button-stable').addClass('button-calm');
    }
    else {
      $scope.inviteEnabled = false;
      $scope.inviteButtonText = inviteButtonTextInvited;
      $('#option-notification').find('.invite-button').removeClass('button-calm').addClass('button-stable');
    }
  }

  if ($scope.$parent.$parent.isInviting && $scope.displayUser.objectId == $scope.$parent.$parent.interactingWithUser.objectId) {
    $scope.setInviteButtonAvailable(false);
  }

  $scope.saveProfile = function() {
    ParseService.updateAndRetrieve('Users',$scope.currentUser.objectId,$scope.displayUser, function(user) {
      $scope.displayUser = user;
    });
    $('#saved-notification').show();
    $timeout(function() { $('#saved-notification').fadeOut('2000'); }, 2000);
  }

  $scope.sendInvitation = function(user) {
    if ($scope.$parent.$parent.isInviting == true) {
      $scope.$parent.$parent.showBusyPopup();
      return;
    }

    $scope.$parent.$parent.isInviting = true;
    $scope.$parent.$parent.interactingWithUser = user;
    PubNubService.sendNotificationToChannel(user.objectId, $scope.currentUser, "Invitation Received", {});
    $scope.setInviteButtonAvailable(false);
  }
})