(function() {
    'use strict';

    angular.module('app.dashboard.modules', [
        'app.auth-status',
        'modules.atmpc-game',
        'modules.gitlab-commits',
        'modules.gitlab-milestones',
        'modules.odoo-invoice',
        'modules.odoo-opportunities',
        'modules.weather',
        'modules.odoo-projects',
        'modules.gitlab-issues'
        //New modules should be added here
    ]);
})();
