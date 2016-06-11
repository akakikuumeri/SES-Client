(function () {
    'use strict';

    angular
        .module('common.config', [])
        .factory('configService', configService);

    function configService(Restangular, $location) {
        var serverURL = $location.$$protocol + "://" + $location.$$host + ':8000/api';
        return Restangular.withConfig(function(RestangularConfigurer) {
            RestangularConfigurer.setBaseUrl(serverURL);
            RestangularConfigurer.setRequestSuffix('/');
        });
    }
})();
