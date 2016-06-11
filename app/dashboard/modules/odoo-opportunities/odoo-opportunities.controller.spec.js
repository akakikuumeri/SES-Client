(function() {
    'use strict';

    describe('Opportunities', function() {
        var controller;
        var $scope;
        var odooPollingService;
        var $odoo;

        var odooPollingServiceData;

        beforeEach(module('modules.odoo-opportunities'));

        beforeEach(inject(function($controller, $rootScope, $q) {
            $scope = $rootScope.$new();
            $scope.settings = {
                chartOptionsMacro: {},
                foo: 'bar'
            };

            odooPollingServiceData = {};
            odooPollingService = {
                start: jasmine.createSpy().and.callFake(function(key) {
                    odooPollingServiceData[key] = {
                        parsed: []
                    };
                }),
                data: odooPollingServiceData
            };

            $odoo = {
                get_session_info: jasmine.createSpy().and.returnValue($q.defer().promise)
            };

            controller = $controller('Opportunities', {
                $scope: $scope,
                $odoo: $odoo,
                odooPollingService: odooPollingService
            });
        }));

        it('should extend the provide config object and add chartist plugins', function() {
            expect($scope.config.foo).toBeDefined();
            expect($scope.config.chartOptionsMacro.plugins).toBeDefined();
        });

        it('should start the odoo polling service', function() {
            expect(odooPollingService.start).toHaveBeenCalled();
        });
    });
})();
