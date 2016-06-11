(function() {
    'use strict';

    angular
        .module('modules.odoo-opportunities')
        .directive('sesOdooOpportunitiesMacro', sesOdooOpportunitiesMacro);

    function sesOdooOpportunitiesMacro() {
        var directive = {
            scope: {
                settings: '='
            },
            restrict: 'AE',
            templateUrl: 'dashboard/modules/odoo-opportunities/macro-odoo-opportunities.html',
            controller: 'Opportunities'
        };

        return directive;
    }
})();
