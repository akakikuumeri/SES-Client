(function() {
    'use strict';

    describe('modulesService', function() {
        var $rootScope;
        var $state;
        var configService;
        var modulesService;

        beforeEach(module('app.dashboard', 'ui.router'));

        beforeEach(function() {
            $state = {
                go: jasmine.createSpy('$state.go')
            };
            configService = {
                one: jasmine.createSpy().and.callThrough()
            };

            module(function($provide) {
                $provide.value('$state', $state);
                $provide.value('configService', configService);
            });

            inject(function($q) {
                // Needs to be mocked before the service is initiated
                configService.one.and.returnValue({
                    get: function() {
                        return $q.when({
                            modules: [{
                                id: 8,
                                name: 'a',
                                ordernumber: 4
                            }, {
                                id: 4,
                                name: 'b',
                                ordernumber: 5
                            }, {
                                id: 9,
                                name: 'c',
                                ordernumber: 1
                            }]
                        });
                    }
                });
            });

            inject(function(_modulesService_, _$rootScope_) {
                $rootScope = _$rootScope_;
                modulesService = _modulesService_;
            });
        });

        it('should be defined', function() {
            expect(modulesService).toBeDefined();
        });

        describe('goNext', function() {
            it('should move to state "channel.module", providing the next module in the params', function() {
                $state.params = { moduleId: 4 };
                modulesService.goNext();
                $rootScope.$apply();
                expect($state.go).toHaveBeenCalledWith('channel.module', { moduleId: 9 });
            });

            it('should go to the first module when called on the last module', function() {
                $state.params = { moduleId: 9 };
                modulesService.goNext();
                $rootScope.$apply();
                expect($state.go).toHaveBeenCalledWith('channel.module', { moduleId: 8 });
            });
        });

        describe('goPrevious', function() {
            it('should move to state "channel.module", providing the previous module in the params', function() {
                $state.params = { moduleId: 4 };
                modulesService.goPrevious();
                $rootScope.$apply();
                expect($state.go).toHaveBeenCalledWith('channel.module', { moduleId: 8 });
            });

            it('should go to the last state when called on the first module', function() {
                $state.params = { moduleId: 8 };
                modulesService.goPrevious();
                $rootScope.$apply();
                expect($state.go).toHaveBeenCalledWith('channel.module', { moduleId: 9 });
            });
        });

        describe('reload', function() {
            it('should load the channel', function() {
                expect(configService.one).toHaveBeenCalledTimes(1);
                modulesService.reload();
                expect(configService.one).toHaveBeenCalledTimes(2);
            });

            it('should sort the modules by order number', function() {
                var modules;
                modulesService.getModules().then(function(m) {
                    modules = m;
                });
                $rootScope.$apply();
                expect(modules).toBeDefined();
                expect(modules[0].id).toBe(9);
                expect(modules[1].id).toBe(8);
                expect(modules[2].id).toBe(4);
            });
        });
    });
})();
