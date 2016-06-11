(function () {
    'use strict';

    angular
        .module('app.admin-view')
        .config(config);

    /* @ngInject */
    function config($httpProvider) {
        $httpProvider.defaults.xsrfCookieName = 'csrftoken';
        $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
    }
})();
