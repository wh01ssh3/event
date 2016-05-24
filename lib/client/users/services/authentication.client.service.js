'use strict';

((angular) => {
  angular
    .module('users')
    .factory('Authentication', Authentication);

  function Authentication($http, $q, $localStorage) {
    let user = $localStorage.user;
    return {
      user,
      signin,
      signout
    };

    function signin(credentials) {
      let defer = $q.defer();
      $http
        .post('/api/auth/signin', credentials)
        .success((response) => {
          $localStorage.user = response;
          this.user = response;
          defer.resolve(response);
        }).error((response) => {
        delete $localStorage.user;
        delete this.user;
        defer.reject(response.message);
      });
      return defer.promise;
    }

    function signout() {
      let defer = $q.defer();
      $http
        .get('/api/auth/signout')
        .success(() => {
          delete $localStorage.user;
          this.user = null;
          defer.resolve();
        });
      return defer.promise;
    }
  }
})(window.angular);
