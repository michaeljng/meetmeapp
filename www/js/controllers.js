angular.module('meetme.controllers', [])
	
	.controller('LoginController', function ($scope, $state, ngFB) {

		ngFB.init({appId: '1652380235023803'});

		if (ngFB.getLoginStatus().$$state.value.status == 'connected') {
			$state.go('logged-in');
		}

		$scope.doLogin = function() {
			ngFB.login({scope: 'public_profile,email'}).then(
                	function (response) {
	                   	 if (response.status === 'connected') {
	                        $state.go('logged-in');
	                    } else {
	                        alert('Facebook login failed');
	                    }
	                }
	        );  
		}

	})

	.controller('MainController', function ($scope, ngFB) {

		ngFB.init({appId: '1652380235023803'});

		$scope.fbName = '';
		$scope.nickName = '';

		ngFB.api({
			path: '/me',
			param: {fields: 'name'}
		}).then (
			function(user) {
				$scope.fbName = user.name;
			},
			function(error) {
				console.log(JSON.stringify(error));
				alert('Error connecting to Facebook. Did you log in?');
			});
	})