angular.module('meetme.services', [])

.factory('PushService', function ($http) {
	var headers = {	"X-Ionic-Application-Id": "6db3367a",
					"Authorization": "Y2E1Nzg4ODU3YjQ1NDg3ZjZhZWFmOWNiYzU3MzJlZDhkM2MzNDk0YjMyNzliNzhhOg=="}


	return {
		sendNotificationToUser: function(user, notification) {
			$http({
				method: 'POST',
				url: 'https://push.ionic.io/api/v1/push',
				data: {"tokens":[user.pushToken], "notification":notification},
				headers: headers
			}).then( function successCallback(response) {

			}, function errorCallback(response) {
			    // called asynchronously if an error occurs
			    // or server returns response with an error status.
			});
		}
	}
})


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

		getSingleObject: function(className, params, callback) {
			$http({
				method: 'GET',
				url: 'https://api.parse.com/1/classes/' + className,
				params: {"where" : params},
				headers: headers
			}).then( function successCallback(response) {
				callback(response.data.results[0]);
			}, function errorCallback(response) {
			    // called asynchronously if an error occurs
			    // or server returns response with an error status.
			});
		},

		getById: function(className, id, callback) {
			$http({
				method: 'GET',
				url: 'https://api.parse.com/1/classes/' + className + "/" + id,
				headers: headers
			}).then( function successCallback(response) {
				callback(response.data);
			}, function errorCallback(response) {
			    // called asynchronously if an error occurs
			    // or server returns response with an error status.
			});
		},

		create: function(className, object, callback) {
			$http({
				method: 'POST',
				url: 'https://api.parse.com/1/classes/' + className,
				data: object,
				headers: headers
			}).then( function successCallback(response) {
				callback(response);
			}, function errorCallback(response) {
			    // called asynchronously if an error occurs
			    // or server returns response with an error status.
			});
		},

		update: function(className, id, params, callback) {
			$http({
				method: 'PUT',
				url: 'https://api.parse.com/1/classes/' + className + '/' + id,
				data: params,
				headers: headers
			}).then( function successCallback(response) {
				callback(response);
			}, function errorCallback(response) {
			    // called asynchronously if an error occurs
			    // or server returns response with an error status.
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
				$state.go('app.logged-out');
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
				$state.go('app.logged-out');
			});
		},

		logout: function(callback) {
			ngFB.logout().then( 
				function () {
					callback();
				}
			);
		},

		login: function(callback) {
			ngFB.login({scope: 'public_profile,email'}).then(
				function(response) {
					callback(response);
				},
				function(error) {
					alert("error logging into facebook");
				}
			);
		},

		loginStatus: function(callback) {
			ngFB.getLoginStatus().then(function(result) {
				callback(result.status);
			});
		},

		getUserFields: function(fields, callback) {
			ngFB.api({
				path: '/me',
				param: {fields: fields}
			}).then (
			function(user) {
				callback(user);
			},
			function(error) {
				$state.go('app.logged-out');
			});
		}

	}
})

