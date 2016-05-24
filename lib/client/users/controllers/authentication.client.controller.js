'use strict';

angular.module('users').controller('AuthenticationController', ['$scope', '$localStorage', '$state', '$http', '$location', '$window', 'toastr', 'Authentication', 'PasswordValidator',
  function ($scope, $localStorage, $state, $http, $location, $window, toastr, Authentication, PasswordValidator) {
    $scope.authentication = Authentication;
    $scope.popoverMsg = PasswordValidator.getPopoverMsg();
    $scope.credentials = {
      profile: {}
    };

    // Get an eventual error defined in the URL query string:
    $scope.error = $location.search().err;

    // If user is signed in then redirect back home
    if ($scope.authentication.user) {
      $location.path('/');
    }

    $scope.signout = () => {
      Authentication.signout().then(() => {
        $state.go('authentication.signin');
      });
    };

    $scope.signin = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'userForm');
        return false;
      }
      //TODO: Move that
      $scope.authentication.signin($scope.credentials).then(() => {
        console.log($scope.authentication.user);
        $state.go($state.previous.state.name || 'home', $state.previous.params);
      }).catch((error) => {
        $scope.error = error;
      });
    };

    // OAuth provider request
    $scope.callOauthProvider = function (url) {
      if ($state.previous && $state.previous.href) {
        url += '?redirect_to=' + encodeURIComponent($state.previous.href);
      }

      // Effectively call OAuth authentication route:
      $window.location.href = url;
    };
  }
]);
