angular.module('meetme.searchTabController', [])

.config(function ($stateProvider, $urlRouterProvider) {

        // Ionic uses AngularUI Router which uses the concept of states
        // Learn more here: https://github.com/angular-ui/ui-router
        // Set up the various states which the app can be in.
        // Each state's controller can be found in controllers.js
        $stateProvider

        .state('app.logged-in.search-tab', {
          url: '/search-tab',
          templateUrl: 'templates/search-tab.html',
          abstract: true
        })

        .state('app.logged-in.search-tab.unavailable', {
          url: '/unavailable?userId',
          templateUrl: 'templates/unavailable-search.html',
          controller: 'UnavailableSearchController'
        })

        .state('app.logged-in.search-tab.available', {
          url: '/available?postId&userId',
          templateUrl: 'templates/available-search.html',
          controller: 'AvailableSearchController'
        })

        .state('app.logged-in.search-tab.user-detail', {
          url: '/user-detail/:userId',
          templateUrl: 'templates/user-profile.html',
          controller: 'UserController'
        })

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/unavailable');

    })

.controller('UnavailableSearchController', function ($scope, $state, $stateParams, ParseService) {

  $scope.userId = $stateParams.userId;

  ParseService.getById('Users', $stateParams.userId, function(user) {
      if (user.isAvailable == true) {
        $state.go('app.logged-in.search-tab.available', {'postId':user.activePost.objectId,'userId':$stateParams.userId});
      }
  });

	$scope.setAvailable = function() {
    ParseService.create('Posts', {"status"   :'A',
                      "expiresAt": {"__type": "Date", 
                              "iso": moment().add(1,'minutes').format() },
                      "user"   : {"__type":"Pointer",
                                  "className":"Users",
                                  "objectId":$scope.userId} }, function(response) {
          $state.go('app.logged-in.search-tab.available', {'postId':response.data.objectId, 'userId':$scope.userId});
        }
      );
	}

})

.controller('AvailableSearchController', function ($scope, $state, $interval, $stateParams, ParseService) {
  
  $scope.matchedUsers = [];
  $scope.user;

  $scope.reload = function() {
    ParseService.get('Users', {"isAvailable":true, "objectId": {"$ne":$stateParams.userId}}, function(results) {
        $scope.matchedUsers = results;
    });
    ParseService.getById('Users', $stateParams.userId, function(user) {
        $scope.user = user;

        if ($scope.user.isAvailable == false) {
          $state.go('app.logged-in.search-tab.unavailable', {'userId':$stateParams.userId});
        }
    });
  }
  
  $scope.reload();

  $interval(function() {
    $scope.reload();  
  }, 5000);


  $scope.setUnavailable = function() {
    ParseService.update('Posts', $stateParams.postId, {"status":'I'}, function(response){
        $state.go('app.logged-in.search-tab.unavailable', {'userId':$stateParams.userId});
      }
    );
  }

  // $scope.showDetails = function(user) {
  //   $state.go('app.logged-in.search-tab.available.user-detail', {'userId':$stateParams.userId});
  // }

})