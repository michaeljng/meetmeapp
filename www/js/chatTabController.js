angular.module('meetme.chatTabController', [])

.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider

  .state('app.logged-in.chat-tab', {
    url: '/chat-tab',
    templateUrl: 'templates/chat-log.html',
    abstract: true
  })

  .state('app.logged-in.chat-tab.chat-log', {
    url: '/chat-log',
    templateUrl: 'templates/chat-log.html',
    controller: 'ChatController',
    // resolve: {
    //   displayUser: function(PreloadFunctions, $stateParams) {
    //     return PreloadFunctions.userById($stateParams.userId);
    //   }
    // }
  })

  // Fallback
  $urlRouterProvider.otherwise('/app/home');
})

.controller('ChatController', function ($scope, $state, $interval, $stateParams, ParseService) {

})