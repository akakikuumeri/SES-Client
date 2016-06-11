(function() {
    'use strict';

    angular
        .module('modules.weather')
        .directive('sesWeatherMacro', sesWeatherMacro);

    function sesWeatherMacro() {
        var directive = {
            scope: {
                settings: '='
            },
            restrict: 'AE',
            templateUrl: 'dashboard/modules/weather/macro-weather.html'
        };

        return directive;
    }
})();
