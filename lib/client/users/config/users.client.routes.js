'use strict';

// Setting up route
angular.module('users').config(['$stateProvider',
  function ($stateProvider) {
    // Users state routing
    $stateProvider
      .state('authentication', {
        abstract: true,
        url: '/authentication',
        templateUrl: 'users/views/authentication/authentication.client.view.html'
      })
      .state('authentication.signin', {
        url: '/signin?err',
        templateUrl: 'users/views/authentication/signin.client.view.html',
        data: {
          auth: true
        }
      });
  }
]);
