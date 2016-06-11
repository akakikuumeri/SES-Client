(function() {
    'use strict';

    angular
        .module('modules.odoo-projects')
        .directive('sesOdooProjectsMicro', sesOdooProjectsMicro);

    function sesOdooProjectsMicro() {
        var directive = {
            scope: {
                settings: '='
            },
            restrict: 'AE',
            templateUrl: 'dashboard/modules/odoo-projects/micro-odoo-projects.html',
            controller: 'Projects'
        };

        return directive;
    }
})();
