(function() {
    'use strict';

    angular.module('app.dashboard', [
        'app.dashboard.modules',
        'app.dashboard.macro-module',
        'app.dashboard.micro-module',
        'ui.bootstrap',
        'ngOdoo',
        'odoo-service',
        'app.admin-view',
        'app.core',
        'common.config'
    ]);
})();
