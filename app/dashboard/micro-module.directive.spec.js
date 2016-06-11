'use strict';

describe('sesMicroModule', function() {
    var $compile;
    var $scope;
    var $state;

    beforeEach(module('app.dashboard.micro-module', 'templates', function($provide) {
        $state = {
            go: jasmine.createSpy('go')
        };
        $provide.value('$state', $state);
    }));

    beforeEach(inject(function(_$compile_, $rootScope) {
        $compile = _$compile_;
        $scope = $rootScope.$new();
    }));

    // TODO: Fix this test
    // it('should open the corresponding state on click', function() {
    //     $scope.module = { id: 1, name: 'a' };
    //     var element = $compile('<div ses-micro-module="module"></div>')($scope);
    //     $scope.$digest();
    //     element.find('.content').triggerHandler('click');
    //     expect($state.go).toHaveBeenCalledWith('.module', { moduleId: 1 });
    // });
});
