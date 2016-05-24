'use strict';

const ApplicationConfiguration = (() => {
  const applicationModuleName = 'Duck News';
  const applicationModuleVendorDependencies = [
    'ngResource',
    'ngSanitize',
    'ngStorage',
    'angular-loading-bar',
    'ngAnimate',
    'ngMessages',
    'ui.router',
    'ui.bootstrap',
    'ui.utils',
    'angularFileUpload',
    'client.templates',
    'angular-timezone-selector',
    'ngLocale',
    'ui.select',
    'toastr',
    'oitozero.ngSweetAlert',
    'ngImgCrop',
    'infinite-scroll'
  ];
  const registerModule = (moduleName, dependencies) => {
    angular.module(moduleName, dependencies || []);
    angular.module(applicationModuleName).requires.push(moduleName);
  };
  return {
    applicationModuleName: applicationModuleName,
    applicationModuleVendorDependencies: applicationModuleVendorDependencies,
    registerModule: registerModule
  };
})();
