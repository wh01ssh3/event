'use strict';

angular
  .module('core')
  .component('header', {
    templateUrl: 'core/components/header/header.view.html',
    replace: true,
    controller: HeaderController
  });

function HeaderController($scope, $state, Authentication, Menus) {
  let ctrl = this;

  ctrl.$onInit = () => {
    ctrl.state = $state;
    ctrl.authentication = Authentication;

    ctrl.menu = Menus.getMenu('topbar');
    ctrl.isCollapsed = false;
  };

  ctrl.toggleCollapsibleMenu = () => {
    ctrl.isCollapsed = !ctrl.isCollapsed;
  };

  ctrl.signout = () => {
    ctrl.authentication.signout().then(() => {
      $state.go('authentication.signin');
    });
  };

  $scope.$on('$stateChangeSuccess', () => {
    $scope.isCollapsed = false;
  });
}
