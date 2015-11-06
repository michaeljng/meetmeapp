angular.module('meetme.controllers', [])
	
	.controller('LoginController', function ($scope, $state, ngFB, ParseService) {

		ngFB.init({appId: '1652380235023803'});
 
		if (ngFB.getLoginStatus().$$state.value.status == 'connected') {
			$state.go('logged-in');
		}

		$scope.doLogin = function() {
			ngFB.login({scope: 'public_profile,email'}).then(
                	function (response) {
	                   	 if (response.status === 'connected') {
	                   	 	ngFB.api({
								path: '/me',
								param: {fields: 'id'}
							}).then (
								function(user) {
									ParseService.get('Users', {"facebookId":user.id}, function(results) { 

										if (results.length == 0) {
											console.log(results.length);
											ParseService.create('Users', {"facebookId":user.id})
										}

										$state.go('logged-in');
									});
							});
	                   	 	
	                    } else {
	                        alert('Facebook login failed');
	                    }
	                }
	        );  
		}

	})

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
				console.log(JSON.stringify(error));
				$state.go('logged-out');
		});

		$scope.updateNickname = function() {
			console.log("HRER");
			ParseService.update('Users', $scope.userId,{"nickName":$scope.nickName});
		}

		$scope.logout = function() {
			ngFB.logout();
			$state.go('logged-out');
		}
	})