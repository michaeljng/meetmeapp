angular.module('meetme.controllers', [])

.controller('MainController', function ($scope, $state, $interval, currentUser, FacebookService, ParseService, PubNubService) {

	$scope.currentUser = currentUser;
	$scope.inviterId = null;
	$scope.pageExtended = false;

	PubNubService.registerForNotificationsChannel($scope.currentUser.objectId, function(type, fromUserId, message){

		console.log("Notification Received! From: " + fromUserId + " Type: " + type + " Message: " + message);

		switch (type) {
			case "Invitation Received":
				$scope.showInvitation(fromUserId);
				break;
			case "Invitation Accepted":
				$state.go('app.logged-in.chat-tab.chat-log', {'currentUserId':$scope.currentUser.objectId, 'chatId': message.chatId});
				break;
			case "Invitation Declined":
				break;
			default:
				break;
		}
	});

	$scope.showInvitation = function(userId) {
		$scope.inviterId = userId;
		$('#invitation-notification').find('.inviter').html(userId + 'has invited you to meet up!');
		$('#invitation-notification').show();
	}

	$scope.declineInvitation = function() {
		$('ion-view').css('top', '0');
		$scope.pageExtended = false;
		PubNubService.sendNotificationToChannel($scope.inviterId, $scope.currentUser.objectId, "Invitation Declined", "");
		$('#invitation-notification').hide();
		$('#invite-reminder').hide();
	}

	$scope.viewProfile = function() {
		$scope.pageExtended = true;
		$state.go('app.logged-in.user-tab.user-detail', {'userId':$scope.inviterId});
		$scope.showInviteReminder($scope.inviterId);
		$('#invitation-notification').hide();
	}

	$scope.showInviteReminder = function(userId) {
		$scope.inviterId = userId;
		$('#invite-reminder').find('.inviter').html(userId + 'has invited you to meet up!');
		$('#invite-reminder').show();
	}

	$scope.acceptInvitation = function(userId) {
		$('ion-view').css('top', '0');
		$scope.pageExtended = false;
		ParseService.get("Chats", {"$or":[{'user1': {"__type":"Pointer",
                                  				 	 "className":"Users",
                                  					 "objectId":$scope.currentUser.objectId},
                                  		   'user2': {"__type":"Pointer",
                                  				 	 "className":"Users",
                                  					 "objectId":$scope.inviterId}},
                                  		  {'user1': {"__type":"Pointer",
                                  				 	 "className":"Users",
                                  					 "objectId":$scope.inviterId},
                                  		   'user2': {"__type":"Pointer",
                                  				 	 "className":"Users",
                                  					 "objectId":$scope.currentUser.objectId}}]}, function(chats) {


            var finishFunc = function(chatId) {
	     		PubNubService.sendNotificationToChannel($scope.inviterId, $scope.currentUser.objectId, "Invitation Accepted", {"chatId": chatId});
	     		$state.go('app.logged-in.chat-tab.chat-log', {'currentUserId':$scope.currentUser.objectId, 'chatId': chatId});
	     		$('#invite-reminder').hide();
	     	}

	     	if (chats.length == 0) {
	     		ParseService.createAndRetrieve("Chats", {'user1': {"__type":"Pointer",
                                  						   "className":"Users",
                                  						   "objectId":$scope.currentUser.objectId},
                                  				 'user2': {"__type":"Pointer",
                                  						   "className":"Users",
                                  						   "objectId":$scope.inviterId}}, function(chat) {
		            finishFunc(chat.objectId);
				});
	     	}
	     	else if (chats.length == 1) {
	     		finishFunc(chats[0].objectId);
	     	}
	   });
	}

	$scope.reloadUserLocation = function() {
		navigator.geolocation.getCurrentPosition(function (location) {
			ParseService.updateAndRetrieve("Users", $scope.currentUser.objectId, {"userLocation": new Parse.GeoPoint(location.coords.latitude, location.coords.longitude)}, function(user) {
				$scope.currentUser = currentUser;
			});
		});
	}

	$scope.reloadUserLocation();
	$interval(function() {
	   $scope.reloadUserLocation();
  	}, 120000); // 2 minutes

	FacebookService.userId(function(id) {
		$scope.userId = id;
		ParseService.get('Users', {"facebookId":id}, function(results) {
			$scope.userId = results[0].objectId;
		});
	})
})