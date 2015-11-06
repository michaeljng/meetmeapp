angular.module('meetme.controllers', [])

.controller('MainController', function ($scope, $state, FacebookService, ParseService) {

	$scope.fbName = '';
	$scope.nickName = '';
	$scope.userId = '';

	FacebookService.userId(function(id) {
		$scope.userId = id;
		ParseService.get('Users', {"facebookId":id}, function(results) { 
			$scope.nickName = results[0].nickName;
			$scope.userId = results[0].objectId;
		});
	})

	FacebookService.name(function(name) {
		$scope.fbName = name;
	})


	$scope.updateNickname = function() {
		ParseService.update('Users', $scope.userId,{"nickName":$scope.nickName});
	}

	$scope.logout = function() {
		FacebookService.logout();
		$state.go('logged-out');
	}
})