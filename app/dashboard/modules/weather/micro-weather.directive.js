(function() {
    'use strict';

    angular
        .module('modules.weather')
        .directive('sesWeatherMicro', sesWeatherMicro);

    /* @ngInject */
    function sesWeatherMicro() {
        var directive = {
            scope: {
                settings: '='
            },
            restrict: 'AE',
            templateUrl: 'dashboard/modules/weather/micro-weather.html'
        };

        return directive;
    }
})();
