angular.module('meetme.chatTabController', [])

.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app.logged-in.chat-tab', {
    url: '/chat-tab',
    templateUrl: 'templates/chat-tab.html',
    abstract: true
  })

  .state('app.logged-in.chat-tab.chat-log', {
    url: '/chat-log',
    templateUrl: 'templates/chat-log.html',
    controller: 'ChatController',
  })

  // Fallback
  $urlRouterProvider.otherwise('/app/home');
})

.controller('ChatController', function ($scope, $state, $interval, $stateParams, ParseService) {

  var $input = $('#chat-input');
  var $output = $('#chat-output');

  var pubnub = PUBNUB.init({                          
        publish_key   : 'pub-c-630fe092-7461-4246-b9ba-a6b201935fb7',
        subscribe_key : 'sub-c-a57136cc-9870-11e5-b53d-0619f8945a4f'
  });

  var channel = 'testChannel';

  var pubnub = PUBNUB.init({                          
        publish_key   : 'pub-c-630fe092-7461-4246-b9ba-a6b201935fb7',
        subscribe_key : 'sub-c-a57136cc-9870-11e5-b53d-0619f8945a4f'
  });
  // when we receive messages
  pubnub.subscribe({
    channel: channel, // our channel name
    message: function(text) { // this gets fired when a message comes in

      // create a new line for chat text
      var $line = $('<li />');

      // filter out html from messages
      var $message = $('<span />').text(text).html();

      // build the html elements
      $line.append($message);
      $output.append($line);

      // scroll the chat output to the bottom
      $output.scrollTop($output[0].scrollHeight);

    }
  });

  // when the "send message" form is submitted
  $scope.sendMessage = function() {

    // publish input value to channel 
    pubnub.publish({
      channel: channel,
      message: $input.val()
    });

    console.log($input.val());

    // clear the input field
    $input.val('');

     // cancel event bubbling
    return false;

  };
})