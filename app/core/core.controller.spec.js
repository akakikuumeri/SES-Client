'use strict';

describe('Core', function () {
    var controller;
    var $scope;
    var $state;

    beforeEach(module('app.core'));

    beforeEach(inject(function ($controller, $rootScope) {
        $state = {
            go: jasmine.createSpy(),
            current: {}
        };
        $scope = $rootScope.$new();
        controller = $controller('Core', {
            $state: $state,
            $scope: $scope
        });
    }));

    it('should be defined', function () {
        expect(controller).toBeDefined();
    });

    describe('switchView', function () {
        it('should redirect you to admin page when on the main page', function () {
            $state.current.name = 'channel';
            controller.switchView();
            expect($state.go).toHaveBeenCalledWith('admin-view.channel-management');
        });

        it('should redirect you to main page when on the admin page', function () {
            $state.current.name = 'admin-view';
            controller.switchView();
            expect($state.go).toHaveBeenCalledWith('channel');
        });
    });

});
