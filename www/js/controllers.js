angular.module('meetme.controllers', [])

.controller('MainController', function ($scope, $state, FacebookService, ParseService) {

	FacebookService.userId(function(id) {
		$scope.userId = id;
		ParseService.get('Users', {"facebookId":id}, function(results) {
			$scope.userId = results[0].objectId;
		});
	})

	// $scope.goHomepage = function() {
	// 	// 
	// 	console.log("hello");
	// }
})