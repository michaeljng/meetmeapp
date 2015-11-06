angular.module('meetme.controllers', [])

	.controller('MainController', function ($scope, $state, ngFB, ParseService) {

		ngFB.init({appId: '1652380235023803'});

		$scope.fbName = '';
		$scope.nickName = '';
		$scope.userId = '';

		ngFB.api({
			path: '/me',
			param: {fields: 'name, id'}
		}).then (
			function(user) {
				$scope.fbName = user.name;
				
				ParseService.get('Users', {"facebookId":user.id}, function(results) { 
					$scope.nickName = results[0].nickName;
					$scope.userId = results[0].objectId;
				});
			},
			function(error) {
				$state.go('logged-out');
		});

		$scope.updateNickname = function() {
			ParseService.update('Users', $scope.userId,{"nickName":$scope.nickName});
		}

		$scope.logout = function() {
			ngFB.logout();
			$state.go('logged-out');
		}
	})