(function() {
    'use strict';

    describe('Invoice', function() {
        var controller;

        var $scope;
        var $odoo;
        var odooPollingService;

        beforeEach(module('modules.odoo-invoice'));

        beforeEach(inject(function($controller, $rootScope, $q) {
            $scope = $rootScope.$new();
            $scope.settings = {
                chartOptionsMacro: {},
                foo: 'bar'
            };
            $odoo = {
                get_session_info: jasmine.createSpy().and.returnValue($q.defer().promise)
            };
            odooPollingService = {
                start: jasmine.createSpy(),
                data: {
                    'invoice-module': {}
                }
            };

            controller = $controller('Invoice', {
                $scope: $scope,
                $odoo: $odoo,
                odooPollingService: odooPollingService
            });
        }));

        it('should be defined', function() {
            expect(controller).toBeDefined();
        });

        it('should extend the provide config object and add chartist plugins', function() {
            expect($scope.config.foo).toBeDefined();
            expect($scope.config.chartOptionsMacro.plugins).toBeDefined();
        });

        it('should start the odoo polling service', function() {
            expect(odooPollingService.start).toHaveBeenCalled();
        });
    });
})();
