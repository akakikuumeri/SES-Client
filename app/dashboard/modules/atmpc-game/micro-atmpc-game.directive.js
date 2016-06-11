(function() {
    'use strict';

    angular
        .module('modules.atmpc-game')
        .directive('sesAtmpcGameMicro', sesAtmpcGameMicro);

    /* @ngInject */
    function sesAtmpcGameMicro() {
        var directive = {
            scope: {},
            restrict: 'AE',
            templateUrl: 'dashboard/modules/atmpc-game/micro-atmpc-game.html'
        };

        return directive;
    }
})();
