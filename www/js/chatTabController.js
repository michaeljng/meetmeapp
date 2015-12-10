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
    url: '/chat-log/:chatId/:currentUserId',
    templateUrl: 'templates/chat-log.html',
    controller: 'ChatController',
  })

  // Fallback
  $urlRouterProvider.otherwise('/app/home');
})

.controller('ChatListController', function ($scope, currentUser, ParseService) {

  $scope.currentUser = currentUser;
  $scope.chats = [];

  $scope.getOtherUserInChat = function(chat, callback) {

    if (chat.user1.objectId == $scope.currentUser.objectId) {
      ParseService.getById("Users", chat.user2.objectId, function(user){
        return callback(user);
      })
    }
    else {
      ParseService.getById("Users", chat.user1.objectId, function(user){
        return callback(user);
      })
    }
  }

  ParseService.get("Chats",{"$or":[{"user1"   : {"__type":"Pointer",
                                                "className":"Users",
                                                "objectId":$scope.currentUser.objectId}},
                                   {"user2"   : {"__type":"Pointer",
                                                "className":"Users",
                                                "objectId":$scope.currentUser.objectId}}]}, function(chats) {                                      
    
    $scope.chats = chats;                                               

    for (var i = 0; i < $scope.chats.length; i++) {
      var chat = $scope.chats[i];
      $scope.getOtherUserInChat(chat, function(user){
        chat.otherUser = user;
      });
    }                                             

    // console.log(JSON.stringify($scope.chats, null, '\t'));
  });
})

.controller('ChatController', function ($scope, $state, $interval, $stateParams, ParseService, PubNubService) {

  var $input = $('#chat-input');
  var $output = $('#chat-output');

  $scope.chatId = $stateParams.chatId;
  $scope.currentUserId = $stateParams.currentUserId;
  $scope.chatMessages = [];

  PubNubService.registerForChatsChannel($scope.chatId, function(chat) {
    // create a new line for chat text
      var $line = $('<li />');

      // filter out html from messages
      var $message = $('<span />').text(chat).html();

      // build the html elements
      $line.append($message);
      $output.append($line);

      // scroll the chat output to the bottom
      $output.scrollTop($output[0].scrollHeight);
  })

  // when the "send message" form is submitted
  $scope.sendMessage = function() {

    PubNubService.sendChatToChannel($stateParams.chatId, $scope.currentUserId, $input.val());

    console.log($input.val());

    // clear the input field
    $input.val('');

     // cancel event bubbling
    return false;
  };
})