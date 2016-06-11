(function() {
    'use strict';

    angular
        .module('app.auth-status', [])
        .directive('sesAuthStatus', sesAuthStatus);

    function sesAuthStatus() {
        var directive = {
            scope: {
                failed: '=',
                micro: '='
            },
            restrict: 'AE',
            templateUrl: 'common/directives/auth-status/auth-status.html'
        };

        return directive;
    }
})();
