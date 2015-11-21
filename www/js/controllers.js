angular.module('meetme.controllers', [])

.controller('MainController', function ($scope, $state, $interval, currentUser, FacebookService, ParseService) {

	$scope.currentUser = currentUser;

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

	// $scope.goHomepage = function() {
	// 	// 
	// 	console.log("hello");
	// }
})