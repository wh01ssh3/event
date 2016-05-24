'use strict';

//Start by defining the main module and adding the module dependencies
angular.module(ApplicationConfiguration.applicationModuleName, ApplicationConfiguration.applicationModuleVendorDependencies);

angular.module(ApplicationConfiguration.applicationModuleName)
  .config(($compileProvider, $logProvider, $locationProvider, $httpProvider, cfpLoadingBarProvider) => {
    $compileProvider.debugInfoEnabled(true);
    $logProvider.debugEnabled(true);
    // Setting HTML5 Location Mode
    $locationProvider.html5Mode(true).hashPrefix('!');
    $httpProvider.interceptors.push('authInterceptor');
    cfpLoadingBarProvider.includeSpinner = false;
  });

angular.module(ApplicationConfiguration.applicationModuleName).run(($rootScope, $state, Authentication, uibPaginationConfig) => {
  $rootScope.$on('$stateChangeStart', (event, toState, toParams) => {
    if (Authentication.user === undefined && typeof Authentication.user !== 'object') {
      if (toState.data && toState.data.auth) {
        return true;
      }
      event.preventDefault();
      $state.go('authentication.signin').then(() => {
        storePreviousState(toState, toParams);
      });
    }
  });

  // Record previous state
  $rootScope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => {
    storePreviousState(fromState, fromParams);
  });

  // Store previous state
  function storePreviousState(state, params) {
    // only store this state if it shouldn't be ignored
    if (!state.data || !state.data.ignoreState) {
      $state.previous = {
        state: state,
        params: params,
        href: $state.href(state, params)
      };
    }
  }

  uibPaginationConfig.nextText = 'Вперед';
  uibPaginationConfig.previousText = 'Назад';
  uibPaginationConfig.firstText = 'В начало';
  uibPaginationConfig.lastText = 'В конец';
});

//Then define the init function for starting up the application
angular.element(document).ready(($http) => {
  //Fixing facebook bug with redirect
  if (window.location.hash && window.location.hash === '#_=_') {
    if (window.history && history.pushState) {
      window.history.pushState('', document.title, window.location.pathname);
    } else {
      // Prevent scrolling by storing the page's current scroll offset
      var scroll = {
        top: document.body.scrollTop,
        left: document.body.scrollLeft
      };
      window.location.hash = '';
      // Restore the scroll offset, should be flicker free
      document.body.scrollTop = scroll.top;
      document.body.scrollLeft = scroll.left;
    }
  }

  //Then init the app
  angular.bootstrap(document, [ApplicationConfiguration.applicationModuleName], {
    strictDi: true
  });

  $http.get('/api/version').then((response) => {
    document.title = `DuckNews - ${response.version.slice(0, 7)}`;
  });
});
