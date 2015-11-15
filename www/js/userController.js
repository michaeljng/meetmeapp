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

.controller('UserController', function ($scope, $state, $interval, ParseService, FacebookService) {

	$scope.user = null;
	$scope.post = null;

	$scope.reload = function() {
		FacebookService.getUserFields(['name', 'id'], function(user) {
			ParseService.get('Users', {"facebookId":user.id}, function(results) {
				$scope.user = results[0];
				navigator.geolocation.getCurrentPosition(function (location) {
					$scope.user.userLocation = new Parse.GeoPoint(location.coords.latitude, location.coords.longitude);
					var latlon = location.coords.latitude + "," + location.coords.longitude;

					var img_url = "http://maps.googleapis.com/maps/api/staticmap?center="+latlon+"&zoom=14&size=350x300&sensor=false";

					document.getElementById("mapholder").innerHTML = "<img src='"+img_url+"'>";
				})
			});
		});
	}

	$scope.reload();

	$interval(function() {
		$scope.reload();	
	}, 10000);

	$scope.handlePost = function() {
		if ($scope.user.isAvailable == true) {
			ParseService.create('Posts', {"expiresAt": {"__type": "Date", "iso": moment().add(1,'minutes').format() },"status":'A',"user":{"__type":"Pointer","className":"Users","objectId":$scope.user.objectId}}).then(
				function(response) {
					$scope.post = response.data;
					console.log($scope.post.objectId);
				},
				function(error){
					$scope.user.isAvailable == false;
					console.log(JSON.stringify(error));
				}
			);
		}
		else {
			ParseService.update('Posts', $scope.post.objectId, {"status":'I'});
		}
	}

	$scope.saveProfile = function() {
		ParseService.update('Users',$scope.user.objectId,$scope.user);
	}

	$scope.logout = function() {
		FacebookService.logout(function() {
			$state.go('app.logged-out');
		});
	}
})