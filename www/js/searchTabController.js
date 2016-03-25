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
          url: '/available/:postId?currentUser&availableSecondsLeft',
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

.controller('UnavailableSearchController', function ($scope, $state, $ionicPopup, $timeout, uuid2, currentUser, ParseService, TimerService) {

  $scope.currentUser = currentUser;
  $scope.data = {};

  $scope.secondsUntil = function(time) {
    return Math.floor((time - moment())/1000);
  }

  if ($scope.currentUser.isAvailable == true) {
    $state.go('app.logged-in.search-tab.available', {'postId':$scope.currentUser.activePost.objectId,'currentUser':JSON.stringify($scope.currentUser), 'availableSecondsLeft': $scope.secondsUntil(new Date($scope.currentUser.activePost.expiresAt.iso))});
  }

  $scope.showNewPost = function() {
    if (!$scope.data.postExpiresAt) {
      $scope.showPopupWarning("Please set a time for when you are availability until");
    } else if (!$scope.data.postDescription) {
      $scope.showPopupWarning("Please add at least 1 activitiy");
    } else {
      var expiresAt = new Date();
      expiresAt.setHours($scope.data.postExpiresAt.getHours());
      expiresAt.setMinutes($scope.data.postExpiresAt.getMinutes());

      if ($scope.secondsUntil(expiresAt) < 0) {
        expiresAt = moment(expiresAt).add(1,'days');
      }

      var seconds = $scope.secondsUntil(expiresAt);
      var description = $scope.data.postDescription;
      $scope.setAvailable(seconds, description);
    }
  };

  $scope.editPostTime = function() {
    var myPopup = $ionicPopup.show({
    template: '<input ng-model="data.postExpiresAt" type="time">',
    title: 'until when?',
    scope: $scope,
    buttons: [
    { text: 'Cancel' },
    {
      text: '<b>Save</b>',
      type: 'button-balanced',
      onTap: function(e) {
        var expiresAt = new Date();
        expiresAt.setHours($scope.data.postExpiresAt.getHours());
        expiresAt.setMinutes($scope.data.postExpiresAt.getMinutes());

        if ($scope.secondsUntil(expiresAt) < 0) {
          expiresAt = moment(expiresAt).add(1,'days');
        }

        var seconds = $scope.secondsUntil(expiresAt);
      }
      }
      ]
    });
  };

  $scope.editPostActivity = function() {
    var myPopup = $ionicPopup.show({
    template: '<textarea id="description" ng-model="data.postDescription" rows="8"></textarea>',
    title: 'to do what?',
    scope: $scope,
    buttons: [
    { text: 'Cancel' },
    {
      text: '<b>Save</b>',
      type: 'button-balanced',
      onTap: function(e) {
        var description = $scope.data.postDescription;
      }
      }
      ]
    });
  };

  $scope.showPopupWarning = function(content) {
    $('#warning-popup-notification').html(content);
    $('#warning-popup-notification').show();
    $timeout(function() { $('#warning-popup-notification').fadeOut('2000'); }, 2000);
  }

	$scope.setAvailable = function(postSeconds, postDescription) {
    console.log(postSeconds);
    console.log(moment());
    console.log(moment().add(postSeconds,'seconds'));
    ParseService.createAndRetrieve('Posts', {
            "status" : 'A',
            "expiresAt" : {"__type": "Date",
                          "iso": moment().add(postSeconds,'seconds').format() },
            "user" : {"__type":"Pointer",
                      "className":"Users",
                      "objectId":$scope.currentUser.objectId },
            "description" : postDescription }, function(response) {

          var timerId = uuid2.newguid();
          $scope.$parent.$parent.availabilityTimerId = timerId;
          TimerService.setAvailabilityTimer(postSeconds,currentUser.objectId,timerId,response.objectId);

          $state.go('app.logged-in.search-tab.available', {'postId':response.objectId, 'currentUser':JSON.stringify($scope.currentUser), 'availableSecondsLeft':postSeconds});
        });
	}
})


.controller('AvailableSearchController', function ($scope, $state, $interval, $stateParams, ParseService, PubNubService) {

  $scope.matchedUsers = [];
  $scope.currentUser = JSON.parse($stateParams.currentUser);
  console.log(JSON.stringify($stateParams, null, 2));
  $scope.$parent.$parent.$parent.setAvailableTimer($stateParams.availableSecondsLeft);

  $scope.reload = function() {
    ParseService.getWithInclude('Users', {"isAvailable":true, "objectId": {"$ne":$scope.currentUser.objectId}}, 'activePost', function(results) {
        $scope.matchedUsers = results;
        for (userIdx in $scope.matchedUsers) {
          var postExpiresAt = new Date($scope.matchedUsers[userIdx].activePost.expiresAt.iso);
          $scope.matchedUsers[userIdx].minutesLeftAvailable = Math.floor((postExpiresAt - moment())/60000);
        }
    });
    ParseService.getById('Users', $scope.currentUser.objectId, function(user) {
        $scope.currentUser = user;

        if ($scope.currentUser.isAvailable == false) {
          $scope.$parent.$parent.$parent.showTitle();
          $scope.$parent.$parent.availabilityTimerId = null;
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
        $scope.$parent.$parent.$parent.showTitle();
        $state.go('app.logged-in.search-tab.unavailable');
      }
    );
  }
})