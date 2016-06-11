(function() {
    'use strict';

    angular
        .module('modules.odoo-invoice')
        .controller('Invoice', Invoice);

    function Invoice($scope, $odoo, odooPollingService, $rootScope) {
        $scope.config = $scope.settings;

        function getSession() {
            return $odoo.get_session_info()
        }

        function checkLogin() {
            if (typeof $rootScope.username !== 'undefined') {
                $scope.loggedIn = true;
            } else {
               getSession().then(function (result) {
                    if (result.data.result.uid) {
                        $rootScope.username = result.data.result.username;
                        $scope.loggedIn = true;
                    } else {
                        $scope.loggedIn = false;
                    }
                });
            }
        }

        // TODO: Check if these could be loaded with settings
        $scope.config.chartOptionsMacro = $scope.config.chartOptionsMacro || {};
        $scope.config.chartOptionsMacro.plugins = [
            Chartist.plugins.legend({
                clickable: false
            }),
            Chartist.plugins.ctAxisTitle({
                axisX: {
                    axisTitle: 'Time',
                    axisClass: 'ct-axis-title',
                    offset: {
                        x: 0,
                        y: 35
                    },
                    textAnchor: 'middle'
                },
                axisY: {
                    axisTitle: 'EUR',
                    axisClass: 'ct-axis-title',
                    offset: {
                        x: 0,
                        y: 0
                    },
                    flipTitle: false
                }
            })
        ];

        $scope.chartEvents = {
            draw: function(data) {
                data.element.animate({
                    opacity: {
                        begin: 0,
                        dur: 500,
                        from: 0,
                        to: 1
                    },
                    y2: {
                        begin: 0,
                        dur: 500,
                        from: data.y1,
                        to: data.y2,
                        easing: 'easeOutExpo'
                    }
                });
            }
        };

        $scope.interval = [
            { name: 'Quarter', value: 'quarter' },
            { name: 'Month', value: 'month' },
            { name: 'Week', value: 'week' }
        ];

        var key = 'invoice-module';

        function startPolling(){
            // Start polling data defined in config
            odooPollingService.start(key, $scope.config.dataOptions);

            // Get object reference from odooPollingService
            // Poller updates object with new data automatically
            $scope.chartData = odooPollingService.data[key].parsed;
        }

        $scope.update = function(){
            odooPollingService.update(key, $scope.config.dataOptions);
        };

        checkLogin();
        startPolling();
    }
})();
