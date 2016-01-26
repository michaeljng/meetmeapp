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
          url: '/unavailable',
          templateUrl: 'templates/unavailable-search.html',
          controller: 'UnavailableSearchController',
          resolve: {
            currentUser: function(PreloadFunctions) {
              return PreloadFunctions.currentUser();
            }
          }
        })

        .state('app.logged-in.search-tab.available', {
          url: '/available/:postId?currentUser',
          templateUrl: 'templates/available-search.html',
          controller: 'AvailableSearchController'
        })

        .state('app.logged-in.search-tab.user-detail', {
          url: '/user-detail/:userId?currentUserId',
          templateUrl: 'templates/user-profile.html',
          controller: 'UserController',
          resolve: {
            displayUser: function(PreloadFunctions, $stateParams) {
              return PreloadFunctions.userById($stateParams.userId);
            }
          }
        })

        // if none of the above states are matched, use this as the fallback
        $urlRouterProvider.otherwise('/unavailable');

    })

.controller('UnavailableSearchController', function ($scope, $state, $ionicPopup, uuid2, currentUser, ParseService, TimerService) {

  $scope.currentUser = currentUser;

  if ($scope.currentUser.isAvailable == true) {
    $state.go('app.logged-in.search-tab.available', {'postId':$scope.currentUser.activePost.objectId,'currentUser':JSON.stringify($scope.currentUser)});
  }

  $scope.showNewPost = function() {
    $scope.data = {};

    var myPopup = $ionicPopup.show({
    template: 'Minutes:<input ng-model="data.postMinutes" type="number"> <p/> Description:<textarea id="description" ng-model="data.postDescription" rows="8"></textarea>',
    title: 'Enter Post Information',
    subTitle: 'Please use normal things',
    scope: $scope,
    buttons: [
    { text: 'Cancel' },
    {
      text: '<b>Save</b>',
      type: 'button-positive',
      onTap: function(e) {
        if (!$scope.data.postDescription || !$scope.data.postMinutes) {
            e.preventDefault();
          } else {
            $scope.postMinutes = $scope.data.postMinutes;
            $scope.postDescription = $scope.data.postDescription;
            $scope.setAvailable()
          }
        }
      }
      ]
    });
  };

	$scope.setAvailable = function() {
    ParseService.create('Posts', {
            "status" : 'A',
            "expiresAt" : {"__type": "Date",
                          "iso": moment().add($scope.postMinutes,'minutes').format() },
            "user" : {"__type":"Pointer",
                      "className":"Users",
                      "objectId":$scope.currentUser.objectId },
            "duration" : $scope.postMinutes,
            "description" : $scope.postDescription }, function(response) {
          $state.go('app.logged-in.search-tab.available', {'postId':response.data.objectId, 'currentUser':JSON.stringify($scope.currentUser)});
        }
      );

    var timerId = uuid2.newguid();
    $scope.$parent.$parent.availabilityTimerId = timerId;
    TimerService.setTimer($scope.postMinutes*60,currentUser.objectId,timerId);
	}

})


.controller('AvailableSearchController', function ($scope, $state, $interval, $stateParams, ParseService, PubNubService) {

  $scope.matchedUsers = [];
  $scope.currentUser = JSON.parse($stateParams.currentUser);

  $scope.reload = function() {
    ParseService.getWithInclude('Users', {"isAvailable":true, "objectId": {"$ne":$scope.currentUser.objectId}}, 'activePost', function(results) {
        $scope.matchedUsers = results;
    });
    ParseService.getById('Users', $scope.currentUser.objectId, function(user) {
        $scope.currentUser = user;

        if ($scope.currentUser.isAvailable == false) {
          $state.go('app.logged-in.search-tab.unavailable', {'currentUser.objectId':$scope.currentUser.objectId});
        }
    });
  }

  $scope.reload();

  var reloadInterval = $interval(function() {
    $scope.reload();
  }, 5000);

  $scope.$on("$destroy", function (event) {
    if ( reloadInterval ) {
        $interval.cancel( reloadInterval );
    }
  });

  $scope.setUnavailable = function() {
    ParseService.update('Posts', $stateParams.postId, {"status":'I'}, function(response){
        $scope.$parent.$parent.availabilityTimerId = null;
        $state.go('app.logged-in.search-tab.unavailable');
      }
    );
  }
})