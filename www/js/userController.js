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

	$scope.user = {
		fbId: '',
		fbName: '',
		nickName: '',
		id: '',
		description: '',
		location: '',
		age: '',
		isAvailable: false
	}

	$scope.reload = function() {
		FacebookService.getUserFields(['name', 'id'], function(user) {
			$scope.user.fbId = user.id;
			$scope.user.fbName = user.name;

			ParseService.get('Users', {"facebookId":user.id}, function(results) {
				$scope.user.id = results[0].objectId;
				$scope.user.description = results[0].userDescription;
				navigator.geolocation.getCurrentPosition(function (location) {
					$scope.user.location = new Parse.GeoPoint(location.coords.latitude, location.coords.longitude);
					var latlon = location.coords.latitude + "," + location.coords.longitude;

					var img_url = "http://maps.googleapis.com/maps/api/staticmap?center="+latlon+"&zoom=14&size=350x300&sensor=false";

					document.getElementById("mapholder").innerHTML = "<img src='"+img_url+"'>";
				})
				$scope.user.age = results[0].userAge;
				$scope.user.nickName = results[0].nickName;
				$scope.user.isAvailable = results[0].isAvailable;
			});
		});
	}

	$scope.reload();

	$scope.handlePost = function() {
		console.log($scope.user.id.toString());
		if ($scope.user.isAvailable == true) {
			ParseService.create('Posts', {"userId":$scope.user.id.toString(), "status":'A'}).then(
				function() {
					ParseService.update('Users', $scope.user.id.toString(), {"isAvailable":true}).then(
						function() {
							$scope.reload();
						}
					);
				}
			);
		}
		else {
			ParseService.update('Posts', {"userId":$scope.user.id.toString(), "status":'A'}, {"status":'I'}).then(
				function() {
					ParseService.update('Users', $scope.user.id.toString(), {"isAvailable":false}).then(
						function() {
							$scope.reload();
						}
					);
				}
			);
		}
	}

	$scope.saveProfile = function() {
		ParseService.update('Users', $scope.user.id,{"userDescription":$scope.user.description});
		ParseService.update('Users', $scope.user.id,{"userLocation":$scope.user.location});
		ParseService.update('Users', $scope.user.id,{"userAge":$scope.user.age});
		ParseService.update('Users', $scope.user.id,{"nickName":$scope.user.nickName});
	}

	$scope.logout = function() {
		FacebookService.logout(function() {
			$state.go('app.logged-out');
		});
	}
})