(function() {
    'use strict';

    angular
        .module('app.dashboard.micro-module', [])
        .directive('sesMicroModule', sesMicroModule);

    /* @ngInject */

    function sesMicroModule($state, $compile, $rootScope, $window) {
        var directive = {
            scope: {
                module: '=sesMicroModule'
            },
            restrict: 'A',
            template: 'module',
            link: function(scope, element, attrs) {
                var window = angular.element($window);
                scope.show = show;
                scope.settings = scope.module.settings || {};

                scope.windowWidth = 100;

                scope.getWindowDimensions = function () {
                    return {
                        'w': window.width(),
                        'h': window.height()
                    };
                };

                var updateDimensions = function () {
                    scope.windowWidth = window.width();
                    scope.windowHeight = window.height();
                };

                scope.$watch(scope.getWindowDimensions, updateDimensions, true);



                var content = '<' + scope.module.module + '-micro ng-click="show()" ' +
                    'settings="settings" layout-fill class="micro-module-content"></' + scope.module.module + '-micro>';
                element.html($compile(content)(scope));

                function show() {
                    $state.go('.module', { moduleId: scope.module.id });
                }

                window.bind('resize', function () {
                    scope.$apply();
                });
            }
        };

        return directive;
    }
})();
