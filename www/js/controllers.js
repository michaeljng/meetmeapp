angular.module('meetme.controllers', [])

.controller('MainController', function ($scope, $state, FacebookService, ParseService) {

	FacebookService.userId(function(id) {
		$scope.userId = id;
		ParseService.get('Users', {"facebookId":id}, function(results) {
			$scope.userId = results[0].objectId;
		});
	})

	FacebookService.userId(function(id) {
		$scope.userId = id;
		ParseService.get('Users', {"facebookId":id}, function(results) {
			$scope.userId = results[0].objectId;
		});
	})

	$scope.goHomepage = function() {
		ParseService.getById('Users', $scope.userId, function(user) {
			if (user.isAvailable == true) {
				$state.go('app.logged-in.search-tab.available', {'postId':user.activePost.objectId,'userId':$scope.userId});
			} else {
				$state.go('app.logged-in.search-tab.unavailable', {'userId':$scope.userId});
			}
		});
	}

	$scope.showNotification = function(userInviteName) {
		$('#sub-notification').show();
		$('#sub-notification').find('.inviter').html(userInviteName + ' has invited you to meet up!');
		$('#sub-notification').animate({
			height: "122px"
		}, 500, function() {});
		$('.has-header').animate({
			top: "166px"
		}, 500, function() {});
	}

	$scope.closeNotification = function() {
		$('#sub-notification').hide();
		$('#sub-notification').animate({
			height: "0"
		}, 500, function() {});
		$('.has-header').animate({
			top: "44px"
		}, 500, function() {});
	}

	$scope.showInvitation = function(userInviteName) {
		$('#significant-notification').show();
		$('#sig-lightbox').find('.inviter').html(userInviteName + ' has invited you to meet up!');
	}

	$scope.closeInvitation = function() {
		$('#significant-notification').hide();
	}
})