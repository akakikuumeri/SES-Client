(function() {
    'use strict';

    angular
        .module('modules.odoo-invoice')
        .directive('sesOdooInvoiceMicro', sesOdooInvoiceMicro);

    function sesOdooInvoiceMicro() {
        var directive = {
            scope: {
                settings: '='
            },
            restrict: 'AE',
            templateUrl: 'dashboard/modules/odoo-invoice/micro-odoo-invoice.html',
            controller: 'Invoice'
        };

        return directive;
    }
})();
