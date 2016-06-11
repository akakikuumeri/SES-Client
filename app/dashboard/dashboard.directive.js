(function() {
    'use strict';
//
    angular
        .module('app.dashboard')
        .directive('sesDashboard', sesDashboard);
//
    /* @ngInject */
    function sesDashboard($state, $compile) {
        var directive = {
            scope: {
                module: '=sesDashboard'
            },
            restrict: 'AE',
            templateUrl: 'dashboard/dashboard.html',
            controller: 'Dashboard',
            link: function(scope, elem, attrs) {

                // elem.swipe({
                //     swipeLeft:function() {
        				// 			scope.dashboard.dashboardNext();
        				// 		},
        				// 		swipeRight: function() {
        				// 			scope.dashboard.dashboardPrev();
        				// 		},
                //     threshold: 0,
                //     maxTimeThreshold: 5E3,
                //     fingers: "all"
                // });
            }
        };

        return directive;
    }
})();
