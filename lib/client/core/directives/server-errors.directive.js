'use strict';

//TODO: Need to refactor. Just copied from another project
class ServerError {
  constructor() {
    this.restrict = 'A';
    this.require = '?ngModel';
    this.link = this.linkFunc;
  }

  linkFunc($scope, element, attr, ctrl) {
    element.on('change', () => {
      $scope.$apply(() => {
        if (!ctrl.$error.server) {return;}
        ctrl.$error.server = false;
        ctrl.$invalid = false;
        $scope.$ctrl.newsForm.$error.server = $scope.$ctrl.newsForm.$error.server.filter((field) => {
          return field.$name !== ctrl.$name;
        });
        if ($scope.$ctrl.newsForm.$error.server.length === 0) {
          delete $scope.$ctrl.newsForm.$error.server;
        }
        if (!$scope.$ctrl.newsForm.$error.length) {
          $scope.$ctrl.newsForm.$invalid = false;
          $scope.$ctrl.newsForm.$valid = true;
        }
        $scope.$broadcast('show-errors-check-validity', '$ctrl.newForm');
      });
    });
  }
}
angular.module('core').directive('serverError', () => new ServerError());
