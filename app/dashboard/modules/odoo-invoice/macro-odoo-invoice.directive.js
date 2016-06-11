(function() {
    'use strict';

    angular
        .module('modules.odoo-invoice')
        .directive('sesOdooInvoiceMacro', sesOdooInvoiceMacro);

    function sesOdooInvoiceMacro() {
        var directive = {
            scope: {
                settings: '='
            },
            restrict: 'AE',
            templateUrl: 'dashboard/modules/odoo-invoice/macro-odoo-invoice.html',
            controller: 'Invoice'
        };

        return directive;
    }
})();
