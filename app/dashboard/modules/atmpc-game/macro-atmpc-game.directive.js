(function() {
    'use strict';

    angular
        .module('modules.atmpc-game')
        .directive('sesAtmpcGameMacro', sesAtmpcGameMacro);

    /* @ngInject */
    function sesAtmpcGameMacro() {
        var directive = {
            scope: {},
            restrict: 'AE',
            templateUrl: 'dashboard/modules/atmpc-game/macro-atmpc-game.html',
            link: function(scope) {
              // $.get('./ses-game/build/index.html', function(data) {
              //   $(this).children("div:first").html(data);
              // });
                // $('#webgl-view').atmpc();
                //
                scope.$emit('touchEvents', false);
                scope.$on('$destroy', function() {
                    scope.$emit('touchEvents', true);
                });
            }
        };

        return directive;
    }
})();
