(function() {
    'use strict';

    angular
        .module('modules.odoo-projects')
        .directive('sesOdooProjectsMacro', sesOdooProjectsMacro);

    function sesOdooProjectsMacro() {
        var directive = {
            scope: {
                settings: '='
            },
            restrict: 'AE',
            templateUrl: 'dashboard/modules/odoo-projects/macro-odoo-projects.html',
            controller: 'Projects'
        };

        return directive;
    }
})();
