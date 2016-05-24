'use strict';

//Directive used to set metisMenu and minimalize button
angular.module('core')
  .directive('sideNavigation', function ($timeout) {
    return {
      restrict: 'A',
      controller: ($scope, $element) => {
        $scope.$watch('$ctrl.authentication.user', () => {
          $timeout(() => {
            $element.metisMenu();
          });
        });
      }
    };
  })
  .directive('minimalizaSidebar', function ($timeout) {
    return {
      restrict: 'A',
      template: '<a class="navbar-minimalize minimalize-styl-2 btn btn-primary " href="" ng-click="minimalize()"><i class="fa fa-bars"></i></a>',
      controller: function ($scope, $element) {
        $scope.minimalize = function () {
          angular.element('body').toggleClass('mini-navbar');
          if (!angular.element('body').hasClass('mini-navbar') || angular.element('body').hasClass('body-small')) {
            // Hide menu in order to smoothly turn on when maximize menu
            angular.element('#side-menu').hide();
            // For smoothly turn on menu
            $timeout(function () {
              angular.element('#side-menu').fadeIn(400);
            }, 200);
          } else {
            // Remove all inline style from jquery fadeIn function to reset menu state
            angular.element('#side-menu').removeAttr('style');
          }
        };
      }
    };
  })
  .directive('hideSideNav', () => {
    return {
      restrict: 'A',
      controller: ($scope, $element, Authentication) => {
        $scope.$watch('$ctrl.authentication.user', () => {
          if (!Authentication.user) {
            $element.hide();
            angular.element('#page-wrapper').css('margin', 0);
          }
          else {
            $element.show();
            angular.element('#page-wrapper').removeAttr('style');
          }
        });
      }
    };
  })
  .directive('ngEnter', () => {
    return (scope, element, attrs) => {
      element.bind('keydown keypress', (event) => {
        if (event.which === 13) {
          scope.$apply(() => { scope.$eval(attrs.ngEnter); });
          event.preventDefault();
        }
      });
    };
  })
  .filter('propsFilter', () => {
    return (items, props) => {
      let out = [];
      if (angular.isArray(items)) {
        items.forEach((item) => {
          let itemMatches = false;
          let keys = Object.keys(props);
          for (let i = 0; i < keys.length; i++) {
            let prop = keys[i];
            let text = props[prop].toLowerCase();
            if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
              itemMatches = true;
              break;
            }
          }
          if (itemMatches) {
            out.push(item);
          }
        });
      } else {
        out = items;
      }
      return out;
    };
  })
  .filter('moment', () => {
    return (dateString, format) => {
      return moment(dateString).format(format);
    };
  })
  .filter('uiRouterLinksParser', () => {
    let pattern = /\[(session|user|quest):([\w+]+):\[(.*?)\]\]?/gi;
    return (string) => {
      return string.replace(pattern, '<a ui-sref="$1({id: $2})">$3</a>');
    };
  });
