'use strict';

// Setting up route
angular.module('core').config(['$stateProvider', '$urlRouterProvider',
  function ($stateProvider, $urlRouterProvider) {

    // Redirect to login -> home when route not found
    $urlRouterProvider.otherwise(function ($injector, $location) {
      $injector.get('$state').transitionTo('authentication.signin', null, {
        location: false
      });
    });

    // Home state routing
    $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'core/views/home.client.view.html',
      onEnter: ($state, Authentication) => {
        if (!Authentication.user) {
          $state.go('authentication.signin');
        }
        $state.go('create');
      }
    })
    .state('not-found', {
      url: '/not-found',
      templateUrl: 'core/views/404.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('bad-request', {
      url: '/bad-request',
      templateUrl: 'core/views/400.client.view.html',
      data: {
        ignoreState: true
      }
    })
    .state('forbidden', {
      url: '/forbidden',
      templateUrl: 'core/views/403.client.view.html',
      data: {
        ignoreState: true
      }
    });
  }
]);
