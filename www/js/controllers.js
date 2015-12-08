angular.module('meetme.controllers', [])

.controller('MainController', function ($scope, $state, $interval, currentUser, FacebookService, ParseService, PubNubService) {

	$scope.currentUser = currentUser;
	$scope.inviterId = null;

	PubNubService.registerForNotificationsChannel($scope.currentUser.objectId, function(type, message){

		console.log(type + " " + message)

	});

	$scope.showInvitation = function(userId) {
		$scope.inviterId = userId;
		$('#invitation-notification').show();
	}

	$scope.declineInvitation = function() {
		console.log("hello");
		$('#invitation-notification').hide();
	}

	$scope.viewProfile = function() {
		$state.go('app.logged-in.user-tab.user-detail', {'userId':$scope.inviterId});
		$('#invitation-notification').hide();
	}

	$scope.reloadUserLocation = function() {
		navigator.geolocation.getCurrentPosition(function (location) {
			ParseService.updateAndRetrieve("Users", $scope.currentUser.objectId, {"userLocation": new Parse.GeoPoint(location.coords.latitude, location.coords.longitude)}, function(user) {
				$scope.currentUser = currentUser;
			});
		});
	}

	$scope.reloadUserLocation(); 
	$interval(function() {
	   $scope.reloadUserLocation();  
  	}, 120000); // 2 minutes

	FacebookService.userId(function(id) {
		$scope.userId = id;
		ParseService.get('Users', {"facebookId":id}, function(results) {
			$scope.userId = results[0].objectId;
		});
	})
})