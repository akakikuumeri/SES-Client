(function() {
    'use strict';

    describe('Projects', function() {
        var controller;
        var $scope;
        var $odoo;

        beforeEach(module('modules.odoo-projects'));

        beforeEach(inject(function($controller, $rootScope, $q) {
            $scope = $rootScope.$new();
            $scope.settings = {
                foo: 'bar',
                analytic_account: {
                    targetModule: '',
                    targetFields: [],
                    domain: []
                },
                timesheet: {
                    targetModule: '',
                    targetFields: [],
                    domain: []
                }
            };
            $odoo = {
                search_read: jasmine.createSpy().and.returnValue({
                    $promise: $q.defer().promise
                }),
                get_session_info: jasmine.createSpy().and.returnValue($q.defer().promise)
            };

            controller = $controller('Projects', {
                $scope: $scope,
                $odoo: $odoo
            });
        }));

        it('should be defined', function() {
            expect(controller).toBeDefined();
        });

        it('should use the provided config', function() {
            expect('foo' in $scope.config).toBe(true);
        });
    });
})();
