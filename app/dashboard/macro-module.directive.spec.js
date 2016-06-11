(function() {
    'use strict';

    describe('sesMacroModule', function() {
        var $compile;
        var scope;
        var modulesService;

        beforeEach(module('app.dashboard.macro-module', 'templates'));

        beforeEach(function() {
            modulesService = {
                getModuleById: jasmine.createSpy().and.returnValue({ then: function() {} })
            };
            module(function($provide) {
                $provide.value('modulesService', modulesService);
            });

            inject(function(_$compile_, $rootScope) {
                $compile = _$compile_;
                scope = $rootScope.$new();
            });

            $.fn.swipe = jasmine.createSpy();
        });

        // TODO: Fix these tests
        // it('should listen to swipe events by default', function() {
        //     var elem = $compile('<ses-macro-module></ses-macro-module>')(scope);
        //     scope.$digest();
        //     expect($.fn.swipe).toHaveBeenCalled();
        // });
        //
        // it('should stop listening to swipe events on "touchEvents" event', function() {
        //     var elem = $compile('<ses-macro-module></ses-macro-module>')(scope);
        //     scope.$digest();
        //     scope.$broadcast('touchEvents', false);
        //     expect($.fn.swipe).toHaveBeenCalledWith('disable');
        // });
        //
        // it('should start listening to swipe events on "touchEvents" event', function() {
        //     var elem = $compile('<ses-macro-module></ses-macro-module>')(scope);
        //     scope.$digest();
        //     scope.$broadcast('touchEvents', true);
        //     expect($.fn.swipe).toHaveBeenCalledWith('enable');
        // });
    });
})();
