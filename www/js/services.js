angular.module('meetme.services', [])

.factory('TimerService', function ($http) {

	var serverAddress = 'http://meetmeserver.herokuapp.com'
	// var serverAddress = 'http://localhost:9292'
	var timerEndpoint = '/v1/setTimer'
	var availabilityTimerEndpoint = '/v1/setAvailabilityTimer/'

	return {

		setTimer: function(numSeconds, callbackChannels, timerId) {

			$http({
				method: 'POST',
				url: serverAddress + timerEndpoint,
				params: {"channelNames": callbackChannels, "numOfSeconds": numSeconds, "timerId": timerId}
			}).then( function successCallback(response) {

			}, function errorCallback(response) {
			    // called asynchronously if an error occurs
			    // or server returns response with an error status.
			});
		},

		setAvailabilityTimer: function(numSeconds, callbackChannels, timerId, postId) {

			$http({
				method: 'POST',
				url: serverAddress + availabilityTimerEndpoint + postId,
				params: {"channelNames": callbackChannels, "numOfSeconds": numSeconds, "timerId": timerId}
			}).then( function successCallback(response) {

			}, function errorCallback(response) {
			    // called asynchronously if an error occurs
			    // or server returns response with an error status.
			});
		}
	}
})

.factory('LocationService', function () {

	return {
		milesBetween: function(lat1, lon1, lat2, lon2) {
			return this.kmBetween(lat1, lon1, lat2, lon2) * 0.62137119;
		},

		feetBetween: function(lat1, lon1, lat2, lon2) {
			return this.milesBetween(lat1, lon1, lat2, lon2) * 5280;
		},

		kmBetween: function(lat1, lon1, lat2, lon2) {
		  var R = 6371; // Radius of the earth in km
		  var dLat = (lat2-lat1) * (Math.PI/180);  // deg2rad below
		  var dLon = (lon2-lon1) * (Math.PI/180);
		  var a = 
		    Math.sin(dLat/2) * Math.sin(dLat/2) +
		    Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
		    Math.sin(dLon/2) * Math.sin(dLon/2)
		    ; 
		  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
		  var d = R * c; // Distance in km
		  return d;
		}
	}
})

.factory('PubNubService', function (ParseService) {
	var pubnub = PUBNUB.init({                          
        publish_key   : 'pub-c-630fe092-7461-4246-b9ba-a6b201935fb7',
        subscribe_key : 'sub-c-a57136cc-9870-11e5-b53d-0619f8945a4f',
        ssl: true
  	});

 //  	var currentUser = null;

	// ParseService.getCurrentUser( function(user) {
	// 	currentUser = user;
	// });

	return {

		registerForNotificationsChannel: function(channelName, callback) {
			pubnub.subscribe({
			    channel: channelName, // our channel name
			    message: function(response) { // this gets fired when a message comes in
			      callback(response["type"], response["fromUser"], response["message"]);
			    }
			});
		},
		registerForChatsChannel: function(channelName, callback) {
			pubnub.subscribe({
			    channel: channelName, // our channel name
			    message: function(response) { // this gets fired when a message comes in
			      callback(response["message"], response["fromUser"]);
			    }
			});
		},
		replayChatsChannel: function(channelName, count, callback) {
			pubnub.history({
			    channel : channelName,
			    count : count,
			    callback : function(m){
			      callback(channelName, m[0]);
			    }
			});
		},
		sendNotificationToChannel: function(channelName, fromUser, type, message) {
			pubnub.publish({
		      channel: channelName,
		      message: {"type":type, "fromUser":fromUser, "message":message}
		    });
		},
		sendChatToChannel: function(channelName, fromUser, message) {
			pubnub.publish({
		      channel: channelName,
		      message: {"message":message, "fromUser":fromUser}
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
	          ParseService.getWithInclude('Users', {"facebookId":facebookId}, "activePost",function(users) {
	            dfd.resolve(users[0]);
	          });
	        });
        	return dfd.promise;
		},
		otherUserForChatId: function(chatId, userId) {
	        var dfd = $q.defer();
	        ParseService.getWithInclude('Chats', {"objectId":chatId}, "user1,user2", function(chats) {
	        	var chat = chats[0];
	        	if (chat.user1.objectId == userId) {
	        		dfd.resolve(chat.user2);
	        	}
	        	else {
	          		dfd.resolve(chat.user1);
	        	}
	        });
	        return dfd.promise;
		}
	}
})


.factory('ParseService', function ($http, FacebookService) {

	//Standard
	// var headers = {	"X-Parse-Application-Id": "EvhQWhNkOQrt9FOkJaEAe3tX5qJDfq7K8NMMnpd8",
	// 				"X-Parse-REST-API-Key": "GPHw7mJbToX9Tyw7suXilsbkoUoSKN7wpXuTUqJK"}

	//Rise
	var headers = {	"X-Parse-Application-Id": "LmB0uFwS57tbG9O4JYXvMhe1dBOF0Xmnagio1EhV",
					"X-Parse-REST-API-Key": "7CG6T7BjtYnnCrjoKqaSqsbY8s8ge6fYCp9z81hY"}

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

	obj.getWithInclude = function(className, params, include, callback) {
		$http({
			method: 'GET',
			url: 'https://api.parse.com/1/classes/' + className,
			params: {"where" : params, "include": include},
			headers: headers
		}).then( function successCallback(response) {
			callback(response.data.results);
		}, function errorCallback(response) {
		    // called asynchronously if an error occurs
		    // or server returns response with an error status.
		});
	}

	obj.getCurrentUser = function(callback) {
		FacebookService.userId(function(facebookId) {
          obj.getSingleObject('Users', {"facebookId":facebookId}, function(user) {
            callback(user);
          });
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
			console.log(JSON.stringify(response,null,'\t'));
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

