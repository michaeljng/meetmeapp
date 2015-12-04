angular.module('meetme.controllers', [])

.controller('MainController', function ($scope, $state, $interval, $ionicUser, $ionicPush, $rootScope, currentUser, FacebookService, ParseService) {

	$scope.currentUser = currentUser;
	$scope.inviterId = null;

	$scope.identifyUser = function(userId) {
	 var user = $ionicUser.get();
	 if(!user.user_id) {
	   // Set your user_id here, or generate a random one.
	   user.user_id = userId

	   // // Metadata
	   // angular.extend(user, {
	   // name: 'Simon',
	   // bio: 'Author of Devdactic'
	   // });

	   // Identify your user with the Ionic User Service
	   $ionicUser.identify(user).then(function(){
	    $scope.identified = true;
	    console.log('Identified user ' + user.name + '\n ID ' + user.user_id);
	  });
	 }
	}

	$scope.pushRegister = function() {
	 console.log('Ionic Push: Registering user');

	   // Register with the Ionic Push service.  All parameters are optional.
	   $ionicPush.register({
	     canShowAlert: true, //Can pushes show an alert on your screen?
	     canSetBadge: true, //Can pushes update app icon badges?
	     canPlaySound: true, //Can notifications play a sound?
	     canRunActionsOnWake: true, //Can run actions outside the app,
	     onNotification: function(notification) {

	      var alertParams = notification.alert.split(":");
	      var notificationType = alertParams[0];

	      console.log(JSON.stringify(alertParams,null,'\t'));

	      switch (notificationType) {

	        case "Invitation Received":
	        var fromUserId = alertParams[1];
	        $scope.showInvitation(fromUserId);
	        default:

	      }

	      // $scope.showNotification('John Smith');
	      // $scope.showInvitation('John Smith');
	      return true;
	    }
	  });
	 }

	 $scope.identifyUser($scope.userId);
	$scope.pushRegister();

	 $scope.showInvitation = function(userId) {
	    $scope.inviterId = userId;
	    $('#invitation-notification').show();
	  }

	  $scope.declineInvitation = function() {
	    console.log("hello");
	    $('#invitation-notification').hide();
	  }

	  $scope.viewProfile = function() {
	    $state.go('app.logged-in.user-tab.user-detail', {'userId':$scope.inviterId});
	    $('#invitation-notification').hide();
	  }

	$rootScope.$on('$cordovaPush:tokenReceived', function(event, data) {
	  ParseService.update('Users', $scope.userId, {"pushToken":data.token}, function(response) {
	    console.log('Ionic Push: Saved token ', data.token, data.platform);
	  });
	})


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