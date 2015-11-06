angular.module('meetme.services', [])

.factory('ParseService', function ($http) {

	var headers = {	"X-Parse-Application-Id": "EvhQWhNkOQrt9FOkJaEAe3tX5qJDfq7K8NMMnpd8",
	"X-Parse-REST-API-Key": "GPHw7mJbToX9Tyw7suXilsbkoUoSKN7wpXuTUqJK"}

	return {

		get: function(className, params, callback) {
			$http({
				method: 'GET',
				url: 'https://api.parse.com/1/classes/' + className,
				params: {"where" : params},
				headers: headers
			}).then( function successCallback(response) {
				callback(response.data.results);
			}, function errorCallback(response) {
			    // called asynchronously if an error occurs
			    // or server returns response with an error status.
			});
		},

		create: function(className, object) {
			$http({
				method: 'POST',
				url: 'https://api.parse.com/1/classes/' + className,
				data: object,
				headers: headers
			});
		},

		update: function(className, id, params) {
			$http({
				method: 'PUT',
				url: 'https://api.parse.com/1/classes/' + className + '/' + id,
				data: params,
				headers: headers
			});
		}


	}

})

.factory('FacebookService', function ($state, ngFB) {

	ngFB.init({appId: '1652380235023803'});

	return {
		userId: function(callback) {
			ngFB.api({
				path: '/me',
				param: {fields: 'id'}
			}).then (
			function(user) {
				callback(user.id);
			},
			function(error) {
				$state.go('logged-out');
			});
		},		

		name: function(callback) {
			ngFB.api({
				path: '/me',
				param: {fields: 'name'}
			}).then (
			function(user) {
				callback(user.name);
			},
			function(error) {
				$state.go('logged-out');
			});
		},

		logout: function() {
			ngFB.logout();
		},
		
		login: function(callback) {
			ngFB.login({scope: 'public_profile,email'}).then(
				function(response) {
					callback(response);
				}
			);
		},

		loginStatus: function() {
			return ngFB.getLoginStatus().$$state.value.status;
		},

		getFields: function(fields, callback) {
			ngFB.api({
				path: '/me',
				param: {fields: fields}
			}).then (
			function(user) {
				callback(user);
			},
			function(error) {
				$state.go('logged-out');
			});
		}

	}
})

