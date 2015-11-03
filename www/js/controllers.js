angular.module('meetme.controllers', [])
	
	.controller('LoginController', function ($scope, $state, LoginService) {

		$scope.username = "";
		$scope.password = "";
		$scope.userId = null;

		$scope.doLogin = function() {
			var userId = LoginService.login($scope.username,$scope.password);
			if (userId) {
				$scope.userId = userId;
				$state.go('logged-in',{'userId':userId});
			}
		}

	})

	.controller('MainController', function ($scope, $stateParams) {

		

	})