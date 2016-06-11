(function() {
    'use strict';

    angular
        .module('modules.base')                                         //Rename
        .directive('sesBaseMicro', sesBaseMicro);                       //Rename

    function sesBaseMicro() {                                           //Rename
        var directive = {
            scope: {
                settings: '='
            },
            restrict: 'AE',
            templateUrl: 'dashboard/modules/module-base/micro-base.html'//Rename
        };

        return directive;
    }
})();
