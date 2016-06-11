'use strict';

describe('Dashboard', function() {
    var controller;
    var $scope;
    var $state;
    var modulesService;

    beforeEach(module('ui.router', 'app.dashboard', 'ui.bootstrap'));

    beforeEach(inject(function($controller, $rootScope, $q) {
        $state = {
            go: jasmine.createSpy(),
            current: {}
        };
        $scope = $rootScope.$new();
        modulesService = {
            goNext: jasmine.createSpy(),
            goPrevious: jasmine.createSpy(),
            getModules: jasmine.createSpy().and.returnValue($q.when()),
            reload: jasmine.createSpy()
        };
        controller = $controller('Dashboard', {
            $state: $state,
            $scope: $scope,
            modulesService: modulesService
        });
    }));

    it('should be defined', function() {
        expect(controller).toBeDefined();
    });

    describe('toggleSlideshow', function() {
        beforeEach(function() {
            controller.modules = [
                {module: 'a'},{module: 'b'},{module: 'c'}
            ];
        });

        it("calls the modulesService.goNext if slideshowMode was false", function() {
            $state.params = { moduleName: 'a' };
            controller.toggleSlideshow();
            expect(modulesService.goNext).toHaveBeenCalled();
        });
    });

    describe('nextButton', function() {
        beforeEach(function() {
            controller.modules = [
                {module: 'a'},{module: 'b'},{module: 'c'}
            ];
        });

        it("calls the modulesService.goNext function", function() {
            $state.params = { moduleName: 'a' };
            controller.nextButton();
            expect(modulesService.goNext).toHaveBeenCalled();
        });

        it("turns slideshow off", function() {
            $state.params = { moduleName: 'a' };
            controller.slideshowMode = true;
            controller.toggleSlideshow();
            expect(controller.slideshowMode).toBe(false);
        });
    });

    describe('prevButton', function() {
        beforeEach(function() {
            controller.modules = [
                {module: 'a'},{module: 'b'},{module: 'c'}
            ];
        });

        it("calls the modulesService.goPrevious function", function() {
            $state.params = { moduleName: 'a' };
            controller.prevButton();
            expect(modulesService.goPrevious).toHaveBeenCalled();
        });

        it("turns slideshow off", function() {
            $state.params = { moduleName: 'a' };
            controller.slideshowMode = true;
            controller.toggleSlideshow();
            expect(controller.slideshowMode).toBe(false);
        });
    });
});
