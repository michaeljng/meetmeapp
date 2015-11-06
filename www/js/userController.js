angular.module('meetme.userController', [])

.config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

        .state('user-profile', {
        	url: '/profile',
        	templateUrl: 'templates/user-profile.html',
        	controller: 'UserController'
        })

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/profile');

      })

.controller('UserController', function ($scope, $state, ParseService, FacebookService) {

	$scope.fbId = '';
	$scope.fbName = '';
	$scope.nickName = '';
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
		FacebookService.logout();
		$state.go('logged-out');
	}
})