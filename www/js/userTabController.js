angular.module('meetme.userTabController', [])

.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app.logged-in.user-tab', {
    url: '/user-tab',
    templateUrl: 'templates/user-tab.html',
    abstract: true
  })

  .state('app.logged-in.user-tab.user-detail', {
    url: '/user-detail/:userId?currentUserId',
    templateUrl: 'templates/user-profile.html',
    controller: 'UserController',
    resolve: {
      displayUser: function(PreloadFunctions, $stateParams) {
        return PreloadFunctions.userById($stateParams.userId);
      }
    }
  })

  // Fallback
  $urlRouterProvider.otherwise('/app/home');
})

.controller('UserController', function ($scope, $state, $interval, $stateParams, displayUser, ParseService, PubNubService, FacebookService) {

  $scope.displayUser = displayUser;

  $scope.editable = false;
  $scope.editing = false;
  $scope.inviteDisabled = false;

  if ($scope.displayUser.userLocation) {
    var latlon = $scope.displayUser.userLocation.latitude + "," + $scope.displayUser.userLocation.longitude;
    var img_url = "http://maps.googleapis.com/maps/api/staticmap?center="+latlon+"&zoom=14&size=350x300&sensor=false";
    document.getElementById("mapholder").innerHTML = "<img src='"+img_url+"'>";
  }

  if ($stateParams.currentUserId == $scope.displayUser.objectId) {
    $scope.editable = true;
    $("#editButton").show();
  } else {
    $("#option-notification").show();
  }

  $scope.saveProfile = function() {
    ParseService.updateAndRetrieve('Users',$stateParams.currentUserId,$scope.displayUser, function(user) {
      $scope.displayUser = user;
    });
  }

  $scope.sendInvitation = function(userId) {
    PubNubService.sendNotificationToChannel(userId, $stateParams.currentUserId, "Invitation Received", "test");
    $scope.inviteDisabled = true;
    $('#option-notification').find('.invite-button').html('Invitation sent!');
    $('#option-notification').find('.invite-button').removeClass('button-calm').addClass('button-stable');
  }
})