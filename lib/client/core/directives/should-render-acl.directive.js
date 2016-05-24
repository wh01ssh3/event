'use strict';

((angular) => {
  angular
    .module('core')
    .directive('shouldRenderAcl', shouldRenderAcl);

  function shouldRenderAcl() {
    return {
      restrict: 'A',
      link: (scope, element, attrs) => {
        let roles = scope.$eval(attrs.shouldRenderAcl);
        if (!roles.includes(scope.userRole)) {
          element.hide();
        }
      },
      controller: ($scope, Authentication) => {
        $scope.userRole = Authentication.user.role;
      }
    };
  }
})(window.angular);
