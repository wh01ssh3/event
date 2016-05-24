'use strict';

angular.module('core').controller('HeaderController', ['$scope', '$state', '$localStorage', 'Authentication', 'Menus',
  function ($scope, $state, $localStorage, Authentication, Menus) {
    // Expose view variables
    $scope.$state = $state;
    $scope.authentication = Authentication;

    // Get the topbar menu
    $scope.menu = Menus.getMenu('topbar');

    // Toggle the menu items
    $scope.isCollapsed = false;
    $scope.toggleCollapsibleMenu = function () {
      $scope.isCollapsed = !$scope.isCollapsed;
    };
    $scope.signout = () => {
      Authentication.signout().then(() => {
        $state.go('authentication.signin');
        location.reload();
      });
    };

    // Collapsing the menu after navigation
    $scope.$on('$stateChangeSuccess', function () {
      $scope.isCollapsed = false;
    });
  }
]);
