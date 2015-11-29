angular.module('meetme.services', [])

.factory('PreloadFunctions', function ($q, ParseService, FacebookService) {

	return {
		userById: function(id) {
	        var dfd = $q.defer();
	        ParseService.getById('Users', id, function(user) {
	          dfd.resolve(user);
	        });
	        return dfd.promise;
	    },
	    currentUser: function() {
	        var dfd = $q.defer();
	        FacebookService.userId(function(facebookId) {
	          ParseService.getSingleObject('Users', {"facebookId":facebookId}, function(user) {
	            dfd.resolve(user);
	          });
	        });
        	return dfd.promise;
		}
	}
})


.factory('ParseService', function ($http) {

	var headers = {	"X-Parse-Application-Id": "EvhQWhNkOQrt9FOkJaEAe3tX5qJDfq7K8NMMnpd8",
					"X-Parse-REST-API-Key": "GPHw7mJbToX9Tyw7suXilsbkoUoSKN7wpXuTUqJK"}

	var obj = {};


	obj.get = function(className, params, callback) {
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
	}

	obj.getSingleObject = function(className, params, callback) {
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
	}

	obj.getById = function(className, id, callback) {
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
	}

	obj.createAndRetrieve = function(className, object, callback) {
		console.log("HERE");
		$http({
			method: 'POST',
			url: 'https://api.parse.com/1/classes/' + className,
			data: object,
			headers: headers
		}).then( function successCallback(response) {
			obj.getById(className, response.data.objectId, function(getResponse) {
				callback(getResponse);
			});
		}, function errorCallback(response) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		});
	}

	obj.create = function(className, object, callback) {
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
	}

	obj.updateAndRetrieve = function(className, id, params, callback) {
		$http({
			method: 'PUT',
			url: 'https://api.parse.com/1/classes/' + className + '/' + id,
			data: params,
			headers: headers
		}).then( function successCallback(response) {
			obj.getById(className, id, function(getResponse) {
				callback(getResponse);
			});
		}, function errorCallback(response) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		});
	}

	obj.update = function(className, id, params, callback) {
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
	
	return obj;
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

