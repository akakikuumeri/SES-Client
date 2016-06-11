(function() {
    'use strict';

    angular
        .module('modules.odoo-opportunities')
        .directive('sesOdooOpportunitiesMicro', sesOdooOpportunitiesMicro);

    function sesOdooOpportunitiesMicro() {
        var directive = {
            scope: {
                settings: '='
            },
            restrict: 'AE',
            templateUrl: 'dashboard/modules/odoo-opportunities/micro-odoo-opportunities.html',
            controller: 'Opportunities'
        };

        return directive;
    }
})();
