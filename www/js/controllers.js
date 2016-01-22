angular.module('meetme.controllers', [])

.controller('MainController', function ($scope, $state, $interval, $ionicPopup, TimerService, currentUser, FacebookService, ParseService, PubNubService) {

	$scope.currentUser = currentUser;
	$scope.inviterId = null;
	$scope.inviter = null;
	$scope.pageExtended = false;
	$scope.popupClosed = true;

	$scope.availabilityTimerId = null;
	$scope.invitationTimerId = null;

	PubNubService.registerForNotificationsChannel($scope.currentUser.objectId, function(type, fromUserId, message){

		console.log("Notification Received! From: " + fromUserId + " Type: " + type + " Message: " + JSON.stringify(message));

		switch (type) {
			case "Invitation Received":
				$scope.invitationTimerId = message.timerId;
				TimerService.setTimer(5,$scope.currentUser.objectId,timerId)
				ParseService.getById('Users', fromUserId, function(user){
					$scope.showInvitation(user);
				});
				break;
			case "Invitation Accepted":
				$state.go('app.logged-in.chat-tab.chat-log', {'currentUserId':$scope.currentUser.objectId, 'chatId': message.chatId});
				break;
			case "Invitation Declined":
				break;
			case "Timer Done":
				if (message.timerId == $scope.availabilityTimerId) {
					$scope.availabilityTimerId = null;
					ParseService.getById('Users', $scope.currentUser.objectId, function(user) {
						$scope.currentUser = user;
						ParseService.update('Posts', user.activePost.objectId, {"status":'I'}, function(response){
					        $scope.$parent.$parent.availabilityTimerId = null;
					        $state.go('app.logged-in.search-tab.unavailable');
					      }
					    );
					})
				}
				else if (message.timerId == $scope.invitationTimerId) {
					$scope.invitationTimerId = null;
					$scope.declineInvitation();
				}
				break;
			default:
				break;
		}
	});

	$scope.showInvitation = function(user) {
		$scope.inviter = user;
		$scope.inviterId = user.objectId;
		if ($scope.popupClosed == true) {
			$scope.popupClosed = false;
			var confirmPopup = $ionicPopup.show({
				title: 'Invite received!',
				subTitle: user.facebookName + ' has invited you to meet up!',
				scope: $scope,
				buttons: [
				{
					text: 'Decline Invitation',
					onTap: function(e) {
						$scope.popupClosed = true;
						$scope.declineInvitation();
					}
				},
				{
					text: '<b>See Profile</b>',
					type: 'button-calm',
					onTap: function(e) {
						$scope.popupClosed = true;
						$scope.viewProfile();
					}
				}
				]
			});
		}
	};

	$scope.declineInvitation = function() {
		$('ion-view').css('top', '0');
		$scope.pageExtended = false;
		PubNubService.sendNotificationToChannel($scope.inviterId, $scope.currentUser.objectId, "Invitation Declined", "");
		$('#invite-reminder').hide();
	}

	$scope.viewProfile = function() {
		$scope.pageExtended = true;
		$state.go('app.logged-in.user-tab.user-detail', {'userId':$scope.inviterId});
		$scope.showInviteReminder($scope.inviter);
	}

	$scope.showInviteReminder = function(user) {
		$('#invite-reminder').find('.inviter').html(user.facebookName + ' has invited you to meet up!');
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