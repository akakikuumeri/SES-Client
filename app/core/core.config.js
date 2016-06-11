(function() {
    'use strict';

    angular
        .module('app.core')
        .config(config);

    /* @ngInject */
    function config($urlRouterProvider) {
        $urlRouterProvider.otherwise("/");
    }
})();
