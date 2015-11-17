angular.module('meetme.userController', [])

// .config(function ($stateProvider, $urlRouterProvider) {

//         // Ionic uses AngularUI Router which uses the concept of states
//         // Learn more here: https://github.com/angular-ui/ui-router
//         // Set up the various states which the app can be in.
//         // Each state's controller can be found in controllers.js
//         $stateProvider

//         .state('app.logged-in.userProfile', {
//           url: '/userProfile',
//           templateUrl: 'templates/user-profile.html',
//           controller: 'UserController'
//         })

//         // if none of the above states are matched, use this as the fallback
//         $urlRouterProvider.otherwise('/userProfile');

//     })

.controller('UserController', function ($scope, $state, $interval, $stateParams, ParseService, FacebookService) {

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
				// navigator.geolocation.getCurrentPosition(function (location) {
				// 	$scope.user.userLocation = new Parse.GeoPoint(location.coords.latitude, location.coords.longitude);
				// 	var latlon = location.coords.latitude + "," + location.coords.longitude;

				// 	var img_url = "http://maps.googleapis.com/maps/api/staticmap?center="+latlon+"&zoom=14&size=350x300&sensor=false";

				// 	document.getElementById("mapholder").innerHTML = "<img src='"+img_url+"'>";
				// })
		});
		
	}

	$scope.reload();

	$interval(function() {
		$scope.reload();	
	}, 20000);

	// $scope.toggleAvailable = function() {
	// 	if ($scope.user.isAvailable == true) {
	// 		ParseService.create('Posts', {"status"	 :'A',
	// 									  "expiresAt": {"__type": "Date", 
	// 									  				"iso": moment().add(10,'seconds').format() },
	// 									  "user"	 : {"__type":"Pointer",
	// 									  		  	    "className":"Users",
	// 									  		  	    "objectId":$scope.user.objectId} }).then(
	// 			function(response) {
	// 				$scope.post = response.data;
	// 				console.log($scope.post.objectId);
	// 			},
	// 			function(error){
	// 				$scope.user.isAvailable == false;
	// 				console.log(JSON.stringify(error));
	// 			}
	// 		);
	// 	}
	// 	else {
	// 		ParseService.update('Posts', $scope.post.objectId, {"status":'I'});
	// 	}
	// }

	$scope.saveProfile = function() {
		ParseService.update('Users',$scope.user.objectId,$scope.user, function() {
			$scope.reload();
		});
	}

	// $scope.logout = function() {
	// 	FacebookService.logout(function() {
	// 		$state.go('app.logged-out');
	// 	});
	// }
})