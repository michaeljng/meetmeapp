angular.module('meetme.chatTabController', [])

.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app.logged-in.chat-tab', {
    url: '/chat-tab',
    templateUrl: 'templates/chat-tab.html',
    abstract: true
  })

  .state('app.logged-in.chat-tab.chats-list', {
    url: '/chats-list',
    templateUrl: 'templates/chat-list.html',
    controller: 'ChatListController',
    resolve: {
      currentUser: function(PreloadFunctions) {
        return PreloadFunctions.currentUser();
      }
    }
  })

  .state('app.logged-in.chat-tab.chat-log', {
    url: '/chat-log/:chatId/:currentUserId/:otherUserId',
    templateUrl: 'templates/chat-log.html',
    controller: 'ChatController',
    resolve: {
      otherUser: function(PreloadFunctions, $stateParams) {
        return PreloadFunctions.otherUserForChatId($stateParams.chatId, $stateParams.currentUserId);
      }
    }
  })

  // Fallback
  $urlRouterProvider.otherwise('/app/home');
})

.controller('ChatListController', function ($scope, $state, currentUser, ParseService, PubNubService) {

  $scope.currentUser = currentUser;
  $scope.chats = [];

  $scope.$parent.$parent.$parent.hideBackButton();

  $scope.getOtherUserInChat = function(chat) {
    if (chat.user1.objectId == $scope.currentUser.objectId) {
      return chat.user2;
    }
    else {
      return chat.user1;
    }
  }

  $scope.findChatById= function(id) {
    for (var i = 0; i < $scope.chats.length; i++) {
      var chat = $scope.chats[i];
      if (chat.objectId == id) {
        return chat;
      }
    }
  }

  $scope.tapChat = function(chat) {
    $state.go('app.logged-in.chat-tab.chat-log', {'chatId':chat.objectId,'currentUserId':$scope.currentUser.objectId, 'otherUserId': chat.otherUser.objectId});
    $scope.$parent.$parent.$parent.showBackButton([],function() {
      $state.go('app.logged-in.chat-tab.chats-list');
    });
  }

  ParseService.getWithInclude("Chats",{"$or":[{"user1"   : {"__type":"Pointer",
                                                "className":"Users",
                                                "objectId":$scope.currentUser.objectId}},
                                   {"user2"   : {"__type":"Pointer",
                                                "className":"Users",
                                                "objectId":$scope.currentUser.objectId}}]}, 'user1,user2',function(chats) {
    $scope.chats = chats;

    for (var i = 0; i < $scope.chats.length; i++) {
      var chat = $scope.chats[i];
      chat.otherUser = $scope.getOtherUserInChat(chat);
      PubNubService.replayChatsChannel(chat.objectId, 1, function(chatId, chatMessages){
        var chat = $scope.findChatById(chatId);
        if (chatMessages.length > 0) {
          chat.lastChatText = chatMessages[0].message;
        }
        else {
          chat.lastChatText = 'No Messages With This User'
        }
        $scope.$apply();
      });
    }
  });
})

.controller('ChatController', function ($scope, $state, $interval, $stateParams, $ionicScrollDelegate, otherUser, ParseService, PubNubService) {

  var $input = $('#chat-input');
  var $output = $('#chat-output');

  $scope.chatId = $stateParams.chatId;
  $scope.otherUser = otherUser;
  $scope.chatMessages = [];

  PubNubService.replayChatsChannel($scope.chatId, 25, function(chatId, chatMessages){
      $scope.chatMessages = chatMessages;
      $scope.$apply();
  });

  PubNubService.registerForChatsChannel($scope.chatId, function(chatMessage, fromUser) {
      $scope.chatMessages.push({"message":chatMessage, "fromUser": fromUser});
      $scope.$apply();
  })

  $scope.chatStyle = function(fromUserId) {
    if (fromUserId == $scope.currentUser.objectId) {
      return "chat-self";
    } else {
      return "chat-partner";
    }
  }

  // when the "send message" form is submitted
  $scope.sendMessage = function() {

    if ($input.val() == "") {
      return;
    }

    PubNubService.sendChatToChannel($stateParams.chatId, $scope.currentUser, $input.val());

    console.log($input.val());

    // clear the input field
    $input.val('');

     // cancel event bubbling
    return false;
  };


})

.directive('myRepeatDirective', function ($ionicScrollDelegate) {
  return function(scope, element, attrs) {
    if (scope.$last){
      $ionicScrollDelegate.scrollBottom(false);
    }
    var observer = new MutationObserver(function(mutations) {
      $ionicScrollDelegate.scrollBottom(false);
    });
    observer.observe(element[0], {
      childList: true,
      subtree: true
    });
  };
})