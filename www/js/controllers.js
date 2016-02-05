angular.module('meetme.controllers', [])

.controller('MainController', function ($scope, $state, $interval, $ionicPopup,  uuid2, TimerService, currentUser, FacebookService, ParseService, PubNubService) {

	$scope.currentUser = currentUser;
	$scope.confirmPopup = null;
	$scope.inviter = null;
	$scope.pageExtended = false;
	$scope.popupClosed = true;
	$scope.availabilityTimerId = null;
	$scope.invitationTimerId = null;
	$scope.secondsLeft = 0;
	$scope.timer = null;

	PubNubService.registerForNotificationsChannel($scope.currentUser.objectId, function(type, fromUserId, message){

		console.log("Notification Received! From: " + fromUserId + " Type: " + type + " Message: " + JSON.stringify(message));

		switch (type) {
			case "Invitation Received":
				$scope.invitationTimerId = uuid2.newguid();
				$scope.secondsLeft = 20;
				TimerService.setTimer($scope.secondsLeft,$scope.currentUser.objectId,$scope.invitationTimerId)
				ParseService.getById('Users', fromUserId, function(user){
					$scope.showInvitation(user);
				});
				break;
			case "Invitation Accepted":
				$state.go('app.logged-in.chat-tab.chat-log', {'currentUserId':$scope.currentUser.objectId, 'chatId': message.chatId});
				break;
			case "Invitation Declined":
				$scope.message = message;
				$ionicPopup.alert({title: 'Invitation Declined',
								template: 'Sorry {{message.fromUser.facebookName}} is busy right now'});
				break;
			case "Timer Done":
				if (message.timerId == $scope.availabilityTimerId) {
					$scope.availabilityTimerId = null;
					$state.go('app.logged-in.search-tab.unavailable');
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
		if ($scope.popupClosed == true) {
			$scope.popupClosed = false;
			$scope.confirmPopup = $ionicPopup.show({
				title: 'Invite received!',
				template: '{{inviter.facebookName}} has invited you to meet up! you have {{secondsLeft}} seconds left to respond',
				// subTitle: user.facebookName + ' has invited you to meet up! ' + $scope.secondsLeft + ' seconds left',
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
			$scope.timer = $interval(function(){
				console.log($scope.secondsLeft);
				if ($scope.secondsLeft == 0) {
					$scope.declineInvitation();
				} else {
					$scope.secondsLeft -= 1;
				}
			}, 1000);
		}
	};

	$scope.declineInvitation = function() {
		$('ion-view').css('top', '0');
		$scope.pageExtended = false;
		$interval.cancel($scope.timer);
		PubNubService.sendNotificationToChannel($scope.inviter.objectId, $scope.currentUser.objectId, "Invitation Declined", {"fromUser":$scope.inviter});
		$('#invite-reminder').hide();
		$scope.confirmPopup.close();
	}

	$scope.viewProfile = function() {
		$scope.pageExtended = true;
		$state.go('app.logged-in.user-tab.user-detail', {'userId':$scope.inviter.objectId});
		$scope.showInviteReminder($scope.inviter);
	}

	$scope.showInviteReminder = function(user) {
		$('#invite-reminder').find('.inviter').html(user.facebookName + ' has invited you to meet up!');
		$('#invite-reminder').show();
	}

	$scope.acceptInvitation = function(userId) {
		$('ion-view').css('top', '0');
		$interval.cancel($scope.timer);
		$scope.pageExtended = false;
		ParseService.get("Chats", {"$or":[{'user1': {"__type":"Pointer",
                                  				 	 "className":"Users",
                                  					 "objectId":$scope.currentUser.objectId},
                                  		   'user2': {"__type":"Pointer",
                                  				 	 "className":"Users",
                                  					 "objectId":$scope.inviter.objectId}},
                                  		  {'user1': {"__type":"Pointer",
                                  				 	 "className":"Users",
                                  					 "objectId":$scope.inviter.objectId},
                                  		   'user2': {"__type":"Pointer",
                                  				 	 "className":"Users",
                                  					 "objectId":$scope.currentUser.objectId}}]}, function(chats) {


            var finishFunc = function(chatId) {
	     		PubNubService.sendNotificationToChannel($scope.inviter.objectId, $scope.currentUser.objectId, "Invitation Accepted", {"chatId": chatId});
	     		$state.go('app.logged-in.chat-tab.chat-log', {'currentUserId':$scope.currentUser.objectId, 'chatId': chatId});
	     		$('#invite-reminder').hide();
	     	}

	     	if (chats.length == 0) {
	     		ParseService.createAndRetrieve("Chats", {'user1': {"__type":"Pointer",
                                  						   "className":"Users",
                                  						   "objectId":$scope.currentUser.objectId},
                                  				 'user2': {"__type":"Pointer",
                                  						   "className":"Users",
                                  						   "objectId":$scope.inviter.objectId}}, function(chat) {
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