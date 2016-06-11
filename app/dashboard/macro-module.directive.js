(function() {
    'use strict';

    angular
        .module('app.dashboard.macro-module', [])
        .directive('sesMacroModule', sesMacroModule);

    /* @ngInject */
    function sesMacroModule($compile, $window, $timeout, modulesService) {
        var directive = {
            scope: {
                id: '='
            },
            restrict: 'E',
            link: function(scope, elem, attrs) {
                var macroContent;

                scope.swipeLeft = function() {
                    modulesService.goNext();
                };

                scope.swipeRight = function() {
                    modulesService.goPrevious();
                }

                scope.$watch('id', function(id) {
                    if(id) {
                        modulesService.getModuleById(scope.id).then(function(module) {
                            // Create a new scope for the macro module
                            var macroScope = scope.$new();
                            macroScope.settings = module.settings || {};

                            var content = '<' + module.module + '-macro class="macro-module" ' +
                                'settings="settings" md-swipe-left="swipeLeft()" md-swipe-right="swipeRight()"></' + module.module + '-macro>';
                            elem.html($compile(content)(macroScope));

                            // Get a reference to the just created element for swipe gestures
                            macroContent = elem.find('.macro-module');
                        });
                    }
                });

                // // Swiping can be enabled or disabled by sending a touchEvents
                // // event with a boolean value
                // scope.$on('touchEvents', function(e, enable) {
                //     elem.swipe(enable ? 'enable' : 'disable');
                // });
                //
                // // Apply transformations to the transcluded content
                // elem.swipe({
                //     triggerOnTouchEnd: true,
                //     swipeStatus: swipeStatus,
                //     allowPageScroll: 'vertical',
                //     threshold: 75
                // });

                function swipeStatus(event, phase, direction, distance, duration, fingerCount, fingerData, currentDirection) {
                    if(!macroContent) {
                        return;
                    }

                    var left = direction == 'left';
                    var right = direction == 'right';
                    var directionMultiplier = (left ? -1 : 1);

                    if(phase == 'move' && (left || right)) {
                        var offset = distance * directionMultiplier;
                        macroContent.css('transition-duration', '0s');
                        macroContent.css('transform', 'translateX(' + offset + 'px)');
                    } else if(phase == 'cancel') {
                        cancelTransition();
                    } else if(phase == 'end') {
                        if(direction == currentDirection) {
                            var target = $window.innerWidth * directionMultiplier;
                            macroContent.css('transition-timing-function', 'cubic-bezier(0.52,0,0.68,1)');
                            macroContent.css('transition-duration', '0.3s');
                            macroContent.css('transform', 'translateX(' + target + 'px)');

                            // Change view once the animation is finished
                            $timeout(function() {
                                if(left) {
                                    modulesService.goNext();
                                } else {
                                    modulesService.goPrevious();
                                }
                                macroContent.css('transition-duration', '0s');
                                macroContent.css('transform', 'translateX(0px)');
                            }, 300);
                        } else {
                            cancelTransition();
                        }
                    }
                }

                function cancelTransition() {
                    macroContent.css('transition-timing-function', 'ease-out');
                    macroContent.css('transition-duration', '0.5s');
                    macroContent.css('transform', 'translateX(' + 0 + 'px)');
                }
            }
        };

        return directive;
    }
})();
