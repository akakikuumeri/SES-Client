(function () {
    'use strict';

    describe('AdminView', function () {
        var controller;
        var $scope;
        var configService;
        var $uibModal;

        var channels;

        beforeEach(module('app.admin-view'));

        beforeEach(inject(function ($controller, $rootScope, $q) {
            channels = [
                {label: 'Channel A', is_default: false},
                {label: 'Channel B', is_default: true},
                {label: 'Channel C', is_default: false}
            ];

            configService = {
                all: jasmine.createSpy('configService.all').and.callFake(function (resource) {
                    switch (resource) {
                        case 'channel':
                            return {
                                getList: jasmine.createSpy('channel.getList').and.returnValue($q.when(channels))
                            };
                        case 'module':
                            return {
                                getList: jasmine.createSpy('module.getList').and.returnValue($q.when([]))
                            };
                    }
                }),
                one: jasmine.createSpy('configService.one').and.callFake(function (resource) {
                    switch (resource) {
                        case 'channel':
                            return {
                                get: jasmine.createSpy('channel.get').and.returnValue($q.when({
                                    modules: []
                                }))
                            };
                        case 'settings':
                            return {
                                get: jasmine.createSpy('settings.get').and.returnValue($q.when([]))
                            };
                    }
                })
            };

            $uibModal = {
                open: jasmine.createSpy('$uibModal.open')
            };

            $scope = $rootScope.$new();
            controller = $controller('AdminView', {
                $scope: $scope,
                configService: configService,
                $uibModal: $uibModal
            });
        }));

        it('should be defined', function () {
            expect(controller).toBeDefined();
        });

        describe('defaultChannelSelected', function () {
            it('should return the correct value', function () {
                controller.selectedChannel = {
                    is_default: true
                };
                expect(controller.defaultChannelSelected()).toBe(true);
                controller.selectedChannel = {
                    is_default: false
                };
                expect(controller.defaultChannelSelected()).toBe(false);
            });
        });

        describe('loadChannels', function () {
            it('should set the channels to the view model', function () {
                $scope.$apply();
                expect(controller.channels).toEqual(channels);
            });

            it('should set fullName correctly', function () {
                $scope.$apply();
                expect(controller.channels[0].fullName).toBe('Channel A');
                expect(controller.channels[1].fullName).toBe('Channel B (default)');
                expect(controller.channels[2].fullName).toBe('Channel C');
            });

            it('should set the default channel', function () {
                $scope.$apply();
                expect(controller.defaultChannel).toBeDefined();
                expect(controller.defaultChannel.label).toBe('Channel B');
            });
        });

        describe('loadSettings', function () {
            it('should set the global settings', function () {
                $scope.$apply();
                expect(controller.globalSettings).toBeTruthy();
            });

            it('should set the id for the settings', function () {
                $scope.$apply();
                expect(controller.globalSettings.id).toBeTruthy();
            });
        });

        describe('sortableOptions.stop', function () {
            beforeEach(function () {
                controller.selectedChannel = {
                    modules: [],
                    patch: jasmine.createSpy('selectedChannel.patch')
                };
            });

            it('should update the ordernumber attributes of the modules and call the api', function () {
                controller.selectedChannel = {
                    modules: [{
                        id: 5,
                        module: 'module-a',
                        ordernumber: 5
                    }, {
                        id: 6,
                        module: 'module-b',
                        ordernumber: 4
                    }, {
                        id: 1,
                        module: 'module-c',
                        ordernumber: 3
                    }],
                    patch: jasmine.createSpy('selectedChannel.patch').and.callFake(function() {
                        expect(this.modules).toEqual([{
                            id: 5,
                            module: 'module-a',
                            ordernumber: 1
                        }, {
                            id: 6,
                            module: 'module-b',
                            ordernumber: 2
                        }, {
                            id: 1,
                            module: 'module-c',
                            ordernumber: 3
                        }]);
                    })
                };

                controller.sortableOptions.stop();
                expect(controller.selectedChannel.patch).toHaveBeenCalled();
            });
        });

        describe('createChannel', function () {
            it('should open up a modal', function () {
                expect($uibModal.open).not.toHaveBeenCalled();
                controller.createChannel();
                expect($uibModal.open).toHaveBeenCalled();
            });

            // TODO: Controller as a closure cannot be tested, refactoring required
        });

        describe('duplicateChannel', function () {
            it('should open up a modal', function () {
                expect($uibModal.open).not.toHaveBeenCalled();
                controller.duplicateChannel();
                expect($uibModal.open).toHaveBeenCalled();
            });

            // TODO: Controller as a closure cannot be tested, refactoring required
        });

        describe('removeChannel', function () {
            it('should open up a modal', function () {
                expect($uibModal.open).not.toHaveBeenCalled();
                controller.removeChannel();
                expect($uibModal.open).toHaveBeenCalled();
            });

            // TODO: Controller as a closure cannot be tested, refactoring required
        });

        describe('removeModule', function() {
            it('should remove the selected module', function() {
                var mods = [{
                    id: 10,
                    module: 'module-a'
                }, {
                    id: 12,
                    module: 'module-b'
                }, {
                    id: 14,
                    module: 'module-c'
                }];
                var mods2 = [{
                    id: 10,
                    module: 'module-a'
                }, {
                    id: 12,
                    module: 'module-b'
                }, {
                    id: 14,
                    module: 'module-c'
                }];
                configService.copy = jasmine.createSpy("Cfg Service copy").and.returnValue({patch: jasmine.createSpy()});
                mods2.splice(1, 1);
                controller.selectedChannel = {
                    modules: mods,
                    patch: jasmine.createSpy()
                };

                controller.removeModule(1);
                expect(controller.selectedChannel.modules).toEqual(mods2);
            });
        });

        describe('editModuleConfig', function () {
            it('should open up a modal', function () {
                expect($uibModal.open).not.toHaveBeenCalled();
                controller.editModuleConfig();
                expect($uibModal.open).toHaveBeenCalled();
            });

            // TODO: Controller as a closure cannot be tested, refactoring required
        });

        describe('addModule', function () {
            it('should open up a modal', function () {
                expect($uibModal.open).not.toHaveBeenCalled();
                controller.addModule();
                expect($uibModal.open).toHaveBeenCalled();
            });

            // TODO: Controller as a closure cannot be tested, refactoring required
        });

        describe('setAsDefault', function () {
            it('should open up a modal', function () {
                expect($uibModal.open).not.toHaveBeenCalled();
                controller.setAsDefault();
                expect($uibModal.open).toHaveBeenCalled();
            });

            // TODO: Controller as a closure cannot be tested, refactoring required
        });
    });
})();
