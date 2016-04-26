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
          url: '/available/:activePost?currentUser&availableSecondsLeft',
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
  $scope.categoryArray = [
    {"category":"eat a meal",               "active":false},
    {"category":"game",                     "active":false},
    {"category":"attend a gathering",       "active":false},
    {"category":"play sports",              "active":false},
    {"category":"grab coffee",              "active":false}];
  $scope.savedCategoryArray = JSON.parse(JSON.stringify($scope.categoryArray));
  $scope.onScreenCategories = "";

  $scope.$parent.$parent.$parent.hideBackButton();
  $('.top-bar').css('visibility', 'visible');

  $scope.secondsUntil = function(time) {
    return Math.floor((time - moment())/1000);
  }

  if ($scope.currentUser.isAvailable == true) {
    $state.go('app.logged-in.search-tab.available', {'activePost':JSON.stringify($scope.currentUser.activePost), 'currentUser':JSON.stringify($scope.currentUser), 'availableSecondsLeft': $scope.secondsUntil(new Date($scope.currentUser.activePost.expiresAt.iso))});
  }

  $scope.noCategoriesChosen = function() {
    for (i = 0; i < $scope.categoryArray.length; i++) {
      if($scope.categoryArray[i]["active"] == true) {
        return false;
      }
    }
    return true;
  }

  $scope.showNewPost = function() {
    if (!$scope.data.postExpiresAt) {
      $scope.showPopupWarning("Please set a time.");
    } else if (!$scope.data.postDescription && $scope.noCategoriesChosen()) {
      $scope.showPopupWarning("Please add at least 1 activity.");
    } else {
      var expiresAt = new Date();
      expiresAt.setHours($scope.data.postExpiresAt.getHours());
      expiresAt.setMinutes($scope.data.postExpiresAt.getMinutes());

      if ($scope.secondsUntil(expiresAt) < 0) {
        expiresAt = moment(expiresAt).add(1,'days');
      }

      var seconds = $scope.secondsUntil(expiresAt);
      var description = $scope.stringDescription(true);
      $scope.setAvailable(seconds, description);
    }
  };

  $scope.editPostTime = function() {
    if($scope.data.postExpiresAt != null) {
      var savedTime = $scope.data.postExpiresAt;
    }
    var myPopup = $ionicPopup.show({
    template: '<input ng-model="data.postExpiresAt" type="time">',
    title: 'until when?',
    scope: $scope,
    buttons: [
    { text: 'Cancel',
      onTap: function(e) {
        $scope.data.postExpiresAt = savedTime;
      }
    },
    {
      text: '<b>Save</b>',
      type: 'button-balanced',
      onTap: function(e) {
        if (!$scope.data.postExpiresAt) {
          $scope.showPopupWarning("Please set a time.");
          e.preventDefault();
        } else {
          var expiresAt = new Date();
          expiresAt.setHours($scope.data.postExpiresAt.getHours());
          expiresAt.setMinutes($scope.data.postExpiresAt.getMinutes());

          if ($scope.secondsUntil(expiresAt) < 0) {
            expiresAt = moment(expiresAt).add(1,'days');
          }

          var seconds = $scope.secondsUntil(expiresAt);

          $(".time-container").addClass("completed-container");

          var hours = $scope.data.postExpiresAt.getHours();
          var minutes = $scope.data.postExpiresAt.getMinutes();
          var ampm = hours >= 12 ? 'pm' : 'am';
          hours = hours % 12;
          hours = hours ? hours : 12;
          minutes = minutes < 10 ? '0'+minutes : minutes;
          var strTime = hours + ':' + minutes + ' ' + ampm;
          $(".time-container span").html("until " + strTime);
        }
      }
      }
      ]
    });
  };

  $scope.editPostActivity = function() {
    $scope.onScreenCategories = $scope.stringDescription(false);
    if($scope.data.postDescription != null) {
      var savedDescription = $scope.data.postDescription;
    }
    var myPopup = $ionicPopup.show({
    template: '<div class="do-what-icons"><div class="clickable-category" ng-class="{\'chosen-category\':categoryArray[0][\'active\']}" ng-click="toggleCategory(1)"><i class="icon ion-fork"></i></div><div class="clickable-category" ng-class="{\'chosen-category\':categoryArray[1][\'active\']}" ng-click="toggleCategory(2)"><i class="icon ion-ios-game-controller-a"></i></div><div class="clickable-category" ng-class="{\'chosen-category\':categoryArray[2][\'active\']}" ng-click="toggleCategory(3)"><i class="icon ion-ios-people"></i></div><div class="clickable-category" ng-class="{\'chosen-category\':categoryArray[3][\'active\']}" ng-click="toggleCategory(4)"><i class="icon ion-ios-basketball"></i></div><div class="clickable-category" ng-class="{\'chosen-category\':categoryArray[4][\'active\']}" ng-click="toggleCategory(5)"><i class="icon ion-coffee"></i></div></div><input id="description" class="other-box" ng-model="data.postDescription" placeholder="other..."><div class="icon-translation">{{onScreenCategories}}</div>',
    title: 'to do what?',
    scope: $scope,
    buttons: [
    { text: 'Cancel',
      onTap: function(e) {
        $scope.categoryArray = JSON.parse(JSON.stringify($scope.savedCategoryArray));
        $scope.data.postDescription = savedDescription;
      }
    },
    {
      text: '<b>Save</b>',
      type: 'button-balanced',
      onTap: function(e) {
        if ($scope.data.postDescription || !$scope.noCategoriesChosen()) {
          $scope.savedCategoryArray = JSON.parse(JSON.stringify($scope.categoryArray));
          $(".activity-container").addClass("completed-container");
          $(".activity-container span").html("to " + $scope.stringDescription(true));
        } else {
          $scope.showPopupWarning("Please add at least 1 activitiy");
          e.preventDefault();
        }
      }
      }
      ]
    });
  };

  $scope.stringDescription = function(isFull) {
    var finalString = "";
    for (i = 0; i < $scope.categoryArray.length; i++) {
      if($scope.categoryArray[i]["active"] == true) {
        finalString = finalString + $scope.categoryArray[i]["category"] + ", ";
      }
    }
    if ($scope.data.postDescription == null || $scope.data.postDescription.length === 0 || isFull == false) {
      finalString = finalString.slice(0, -2);
      var customDescription = "";
    } else {
      var customDescription = $scope.data.postDescription;
    }
    return finalString + customDescription;
  }

  $scope.toggleCategory = function(category) {
    $scope.categoryArray[category-1]["active"] = !$scope.categoryArray[category-1]["active"];
    $scope.onScreenCategories = $scope.stringDescription(false);
  }

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

          $state.go('app.logged-in.search-tab.available', {'activePost':JSON.stringify(response), 'currentUser':JSON.stringify($scope.currentUser), 'availableSecondsLeft':postSeconds});
        });
	}
})


.controller('AvailableSearchController', function ($scope, $state, $interval, $stateParams, ParseService, PubNubService, LocationService) {

  $scope.activeUsers = [];
  $scope.matchedUsers = [];
  $scope.selfUser = [];
  $scope.currentUser = JSON.parse($stateParams.currentUser);
  $scope.activePost = JSON.parse($stateParams.activePost);
  console.log(JSON.stringify($stateParams, null, 2));
  $scope.$parent.$parent.$parent.setAvailableTimer($stateParams.availableSecondsLeft);

  $scope.reload = function() {
    ParseService.getWithInclude('Users', {"isAvailable":true}, 'activePost', function(results) {
        $scope.activeUsers = results;
        $scope.matchedUsers = results.filter(function (el) {
          return el.objectId != $scope.currentUser.objectId;
        });;
        $scope.selfUser = results.filter(function (el) {
          return el.objectId == $scope.currentUser.objectId;
        });;
        for (userIdx in $scope.activeUsers) {
          var postExpiresAt = new Date($scope.activeUsers[userIdx].activePost.expiresAt.iso);
          var totalMinutes = Math.floor((postExpiresAt - moment())/60000);
          var computedHours = Math.floor(totalMinutes / 60);
          var computedMinutes = totalMinutes % 60;
          $scope.activeUsers[userIdx].minutesLeftAvailable = computedHours + "hr " + computedMinutes + "min";
          var distance = LocationService.milesBetween($scope.currentUser.userLocation.latitude, $scope.currentUser.userLocation.longitude,
                                                $scope.activeUsers[userIdx].userLocation.latitude, $scope.activeUsers[userIdx].userLocation.longitude);
          // Remove decimals
          distance = distance.toFixed(1);
          $scope.activeUsers[userIdx].searchDistance = distance;
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

  $scope.tapUser = function(userId) {
    $state.go('app.logged-in.user-tab.user-detail', {'displayUserId': userId});
    $scope.$parent.$parent.$parent.showBackButton([JSON.stringify($scope.activePost),JSON.stringify($scope.currentUser)], function(activePost, currentUser) {
      $state.go('app.logged-in.search-tab.available', {'activePost':activePost,'currentUser':currentUser, 'availableSecondsLeft': $scope.availableSecondsLeft});
    });
  }

  $scope.setUnavailable = function() {
    ParseService.update('Posts', $scope.activePost.objectId, {"status":'I'}, function(response){
        $scope.$parent.$parent.availabilityTimerId = null;
        $scope.$parent.$parent.$parent.showTitle();
        $state.go('app.logged-in.search-tab.unavailable');
      }
    );
  }
})