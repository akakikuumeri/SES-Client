(function() {
    'use strict';

    angular
        .module('modules.base')                                         //Rename
        .directive('sesBaseMacro', sesBaseMacro);                       //Rename

    function sesBaseMacro() {                                           //Rename
        var directive = {
            scope: {
                settings: '='
            },
            restrict: 'AE',
            templateUrl: 'dashboard/modules/module-base/macro-base.html'//Rename
        };

        return directive;
    }
})();
