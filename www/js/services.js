angular.module('meetme.services', [])

.factory('PubNubService', function (PreloadFunctions) {
	var pubnub = PUBNUB.init({                          
        publish_key   : 'pub-c-630fe092-7461-4246-b9ba-a6b201935fb7',
        subscribe_key : 'sub-c-a57136cc-9870-11e5-b53d-0619f8945a4f'
  	});

	var currentUser = PreloadFunctions.currentUser();

	return {

		registerForNotificationsChannel: function(channelName, callback) {
			pubnub.subscribe({
			    channel: channelName, // our channel name
			    message: function(response) { // this gets fired when a message comes in
			      callback(response["type"], response["message"]);
			    }
			});
		},
		registerForChatsChannel: function(channelName, callback) {
			pubnub.subscribe({
			    channel: channelName, // our channel name
			    message: function(response) { // this gets fired when a message comes in
			      callback(response["message"]);
			    }
			});
		},
		sendNotificationToChannel: function(channelName, type, message) {
			pubnub.publish({
		      channel: channelName,
		      message: {"type":type, "message":message}
		    });
		},
		sendChatToChannel: function(channelName, message) {
			pubnub.publish({
		      channel: channelName,
		      message: {"message":message}
		    });
		}
	}
})

// .factory('PushService', function ($http, ParseService) {
// 	var headers = {	"X-Ionic-Application-Id": "6db3367a",
// 					"Authorization": "Y2E1Nzg4ODU3YjQ1NDg3ZjZhZWFmOWNiYzU3MzJlZDhkM2MzNDk0YjMyNzliNzhhOg=="}


// 	return {
// 		sendNotificationToUser: function(user, notification) {
// 			console.log(JSON.stringify(user, null, '\t'));
// 			$http({
// 				method: 'POST',
// 				url: 'https://push.ionic.io/api/v1/push',
// 				data: {"tokens":[user.pushToken], "notification":notification},
// 				headers: headers
// 			}).then( function successCallback(response) {

// 			}, function errorCallback(response) {
// 			    // called asynchronously if an error occurs
// 			    // or server returns response with an error status.
// 			});
// 		},
// 		sendNotificationToUserId: function(userId, notification) {
// 			ParseService.getById("Users", userId, function(user) {
// 				console.log(JSON.stringify(user, null, '\t'));
// 				$http({
// 					method: 'POST',
// 					url: 'https://push.ionic.io/api/v1/push',
// 					data: {"tokens":[user.pushToken], "notification":notification},
// 					headers: headers
// 				}).then( function successCallback(response) {

// 				}, function errorCallback(response) {
// 				    // called asynchronously if an error occurs
// 				    // or server returns response with an error status.
// 				});
// 			});
// 		}
// 	}
// })

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

