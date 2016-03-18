angular.module('meetme.controllers', [])

.controller('MainController', function ($scope, $state, $interval, $ionicPopup,  uuid2, TimerService, currentUser, FacebookService, ParseService, PubNubService) {

	$scope.currentUser = currentUser;
	$scope.confirmPopup = null;

	$scope.pageExtended = false;
	$scope.popupClosed = true;
	
	$scope.secondsLeft = 0;
	$scope.invitationTimer = null;

	$scope.isInviting = false;
	$scope.isBeingInvited = false;
	$scope.interactingWithUser = null;

	$scope.availabilityTimerId = null;
	$scope.invitationTimerId = null;

	PubNubService.registerForNotificationsChannel($scope.currentUser.objectId, function(type, fromUser, message){

		console.log("Notification Received! From: " + JSON.stringify(fromUser) + " Type: " + type + " Message: " + JSON.stringify(message));

		switch (type) {
			case "Invitation Received":
				if ($scope.interactingWithUser != null) {
					$scope.declineInvitation(fromUser.objectId);
					return;
				}

				$scope.isBeingInvited = true;
				$scope.interactingWithUser = fromUser;

				$scope.invitationTimerId = uuid2.newguid();
				$scope.secondsLeft = 20;
				TimerService.setTimer($scope.secondsLeft,$scope.currentUser.objectId,$scope.invitationTimerId)

				$scope.showInvitation();
				break;
			case "Invitation Accepted":
				$scope.isInviting = false;
				$scope.showAcceptedInvitation(message.chatId);
				break;
			case "Invitation Declined":
				$scope.isInviting = false;
				$scope.interactingWithUser = null;
				$scope.$broadcast('invitationDeclined', {});
				$ionicPopup.alert({title: 'Invitation Declined',
								template: "Sorry " + fromUser.facebookName + " is busy right now"});
				break;
			case "Timer Done":
				if (message.timerId == $scope.availabilityTimerId) {
					$scope.availabilityTimerId = null;
					$state.go('app.logged-in.search-tab.unavailable');
				}
				else if (message.timerId == $scope.invitationTimerId) {
					$scope.declineInvitation($scope.interactingWithUser.objectId);
				}
				break;
			default:
				break;
		}
	});

	$scope.showInvitation = function() {
		if ($scope.popupClosed == true) {
			$scope.popupClosed = false;
			$scope.confirmPopup = $ionicPopup.show({
				title: 'Invite received!',
				template: '{{interactingWithUser.facebookName}} has invited you to meet up! you have {{secondsLeft}} seconds left to respond',
				// subTitle: user.facebookName + ' has invited you to meet up! ' + $scope.secondsLeft + ' seconds left',
				scope: $scope,
				buttons: [
				{
					text: 'Decline Invitation',
					onTap: function(e) {
						$scope.popupClosed = true;
						$scope.declineInvitation($scope.interactingWithUser.objectId);
					}
				},
				{
					text: '<b>See Profile</b>',
					type: 'button-balanced',
					onTap: function(e) {
						$scope.popupClosed = true;
						$scope.viewInviterProfile();
					}
				}
				]
			});
			$scope.invitationTimer = $interval(function() {
				if ($scope.secondsLeft == 0) {
					$interval.cancel($scope.invitationTimer);
					$scope.invitationTimer = null;
				} else {
					$scope.secondsLeft -= 1;
				}
			}, 1000);
		}
	};

	 $scope.showBusyPopup = function() {
	    $ionicPopup.alert({
	        title: 'Please Wait..',
	        template: 'you already have an invite out to {{interactingWithUser.facebookName}}, please wait for them to respond',
	        // subTitle: user.facebookName + ' has invited you to meet up! ' + $scope.secondsLeft + ' seconds left',
	        scope: $scope
	      });
	  }

	$scope.showAcceptedInvitation = function(chatId) {
		$ionicPopup.show({
				title: 'Invite Accepted!',
				template: '{{interactingWithUser.facebookName}} has accepted your invitation',
				// subTitle: user.facebookName + ' has invited you to meet up! ' + $scope.secondsLeft + ' seconds left',
				scope: $scope,
				buttons: [
				{
					text: 'Ignore',
					onTap: function(e) {
						$scope.interactingWithUser = null;
					}
				},
				{
					text: 'Go to Chat',
					type: 'button-balanced',
					onTap: function(e) {
						$state.go('app.logged-in.chat-tab.chat-log', {'currentUserId':$scope.currentUser.objectId, 'chatId': chatId});
						$scope.interactingWithUser = null;
					}
				}
				]
			});
	}

	$scope.clearInvitationTimer = function() {
		$interval.cancel($scope.invitationTimer);
		$scope.invitationTimer = null;
		$scope.invitationTimerId = null;
	}

	$scope.declineInvitation = function(userId) {
		PubNubService.sendNotificationToChannel(userId, $scope.currentUser, "Invitation Declined", {});
		if (userId == $scope.interactingWithUser.objectId) {
			$('ion-view').css('top', '0');
			$scope.pageExtended = false;
			$scope.isBeingInvited = false;
			$scope.interactingWithUser = null;
			$scope.clearInvitationTimer();
			$('#invite-reminder').hide();
			$scope.confirmPopup.close();
		}
	}

	$scope.viewInviterProfile = function() {
		$scope.pageExtended = true;
		$state.go('app.logged-in.user-tab.user-detail', {'displayUserId':$scope.interactingWithUser.objectId});
		$scope.showInviteReminder();
	}

	$scope.showInviteReminder = function() {
		$('#invite-reminder').find('.inviter').html($scope.interactingWithUser.facebookName + ' has invited you to meet up!');
		$('#invite-reminder').show();
	}

	$scope.acceptInvitation = function() {
		$('ion-view').css('top', '0');
		$scope.clearInvitationTimer();
		$scope.pageExtended = false;
		ParseService.get("Chats", {"$or":[{'user1': {"__type":"Pointer",
                                  				 	 "className":"Users",
                                  					 "objectId":$scope.currentUser.objectId},
                                  		   'user2': {"__type":"Pointer",
                                  				 	 "className":"Users",
                                  					 "objectId":$scope.interactingWithUser.objectId}},
                                  		  {'user1': {"__type":"Pointer",
                                  				 	 "className":"Users",
                                  					 "objectId":$scope.interactingWithUser.objectId},
                                  		   'user2': {"__type":"Pointer",
                                  				 	 "className":"Users",
                                  					 "objectId":$scope.currentUser.objectId}}]}, function(chats) {


            var finishFunc = function(chatId) {
            	$scope.isBeingInvited = false;
	     		PubNubService.sendNotificationToChannel($scope.interactingWithUser.objectId, $scope.currentUser, "Invitation Accepted", {"chatId": chatId});
	     		$scope.interactingWithUser = null;
	     		$state.go('app.logged-in.chat-tab.chat-log', {'currentUserId':$scope.currentUser.objectId, 'chatId': chatId});
	     		$('#invite-reminder').hide();
	     	}

	     	if (chats.length == 0) {
	     		ParseService.createAndRetrieve("Chats", {'user1': {"__type":"Pointer",
                                  						   "className":"Users",
                                  						   "objectId":$scope.currentUser.objectId},
                                  				 'user2': {"__type":"Pointer",
                                  						   "className":"Users",
                                  						   "objectId":$scope.interactingWithUser.objectId}}, function(chat) {
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

 // A confirm dialog
 $scope.showConfirm = function() {
 	var confirmPopup = $ionicPopup.confirm({
 		title: 'Consume Ice Cream',
 		template: 'Are you sure you want to eat this ice cream?'
 	});

 	confirmPopup.then(function(res) {
 		if(res) {
 			console.log('You are sure');
 		} else {
 			console.log('You are not sure');
 		}
 	});
 };

	$scope.reloadUserLocation();
	$interval(function() {
	   $scope.reloadUserLocation();
  	}, 10000); // 10 seconds

	FacebookService.userId(function(id) {
		$scope.userId = id;
		ParseService.get('Users', {"facebookId":id}, function(results) {
			$scope.userId = results[0].objectId;
		});
	})
})