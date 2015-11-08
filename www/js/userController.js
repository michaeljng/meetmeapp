angular.module('meetme.userController', [])

.config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

        .state('app.logged-in.userProfile', {
          url: '/userProfile',
          templateUrl: 'templates/user-profile.html',
          controller: 'UserController'
        })

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/userProfile');

    })

.controller('UserController', function ($scope, $state, ParseService, FacebookService) {

	$scope.fbId = '';
	$scope.fbName = '';
	$scope.nickName = '';
	$scope.userId = '';
	$scope.userDescription = '';
	$scope.userLocation = '';
	$scope.userAge = '';

	FacebookService.getUserFields(['name', 'id'], function(user) {
		$scope.fbId = user.id;
		$scope.fbName = user.name;

		ParseService.get('Users', {"facebookId":user.id}, function(results) {
			$scope.userId = results[0].objectId;
			$scope.userDescription = results[0].userDescription;
			navigator.geolocation.getCurrentPosition(function (location) {
				$scope.userLocation = new Parse.GeoPoint(location.coords.latitude, location.coords.longitude);
				var latlon = location.coords.latitude + "," + location.coords.longitude;

				var img_url = "http://maps.googleapis.com/maps/api/staticmap?center="+latlon+"&zoom=14&size=400x300&sensor=false";

				document.getElementById("mapholder").innerHTML = "<img src='"+img_url+"'>";
			})
			$scope.userAge = results[0].userAge;
			$scope.nickName = results[0].nickName;
		});
	});

	$scope.saveProfile = function() {
		ParseService.update('Users', $scope.userId,{"userDescription":$scope.userDescription});
		ParseService.update('Users', $scope.userId,{"userLocation":$scope.userLocation});
		ParseService.update('Users', $scope.userId,{"userAge":$scope.userAge});
		ParseService.update('Users', $scope.userId,{"nickName":$scope.nickName});
	}

	$scope.logout = function() {
		FacebookService.logout(function() {
			$state.go('app.logged-out');
		});
	}
})