angular.module('meetme.userController', [])

	.controller('UserController', function ($scope, $state, ParseService) {

		ngFB.init({appId: '1652380235023803'});

		$scope.fbId = '';
		$scope.fbName = '';
		$scope.userId = '';
		$scope.userDescription = '';
		$scope.userLocation = '';
		$scope.userAge = 0;

		FacebookService.getUserFields(['name', 'id'], function(user) {
			$scope.fbId = user.id;
			$scope.fbName = user.name;

			ParseService.get('Users', {"facebookId":user.id}, function(results) { 
				$scope.userId = results[0].objectId;
				$scope.userDescription = results[0].userDescription;
				$scope.userLocation = results[0].userLocation;
				$scope.userAge = results[0].userAge;
			});
		});

		$scope.saveProfile = function() {
			ParseService.update('Users', $scope.userId,{"userDescription":$scope.userDescription});
			ParseService.update('Users', $scope.userId,{"userLocation":$scope.userLocation});
			ParseService.update('Users', $scope.userId,{"userAge":$scope.userAge});
		}
	})