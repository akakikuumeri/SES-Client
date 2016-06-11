(function () {
    'use strict';

    angular
        .module('app.dashboard')
        .controller('Dashboard', Dashboard);

    function Dashboard(
        $interval,
        $timeout,
        $scope,
        $state,
        $stateParams,
        $location,
        $anchorScroll,
        $window,
        configService,
        modulesService
    ) {
        var vm = this;

        $scope.dashboard = this;

        var window = angular.element($window);

        // View-model variables (exposed to the view)
        vm.isMacro = isMacroState($state.current);
        vm.channel = configService.one('channel', $stateParams.channelName || 'default').get();
        vm.modules = [];
        vm.groupedModules = [];
        vm.slideshowMode = false;

        // View-model functions
        vm.backToMicros = backToMicros;
        vm.toggleSlideshow = toggleSlideshow;
        vm.nextButton = nextButton;
        vm.prevButton = prevButton;
        vm.dashboardNext = dashboardNext;
        vm.dashboardPrev = dashboardPrev;
        vm.dashboardJumpTo = dashboardJumpTo;

        // Implementation
        modulesService.reload();
        $scope.$watch(function() { return vm.channel; }, function(channelPromise) {
            channelPromise.then(updateModuleList);
        });

        vm.getNumber = function(num) {
          return new Array(num);
        }


        $scope.getWindowDimensions = function () {
            return {
                'w': window.width(),
                'h': window.height()
            };
        };

        var updateDimensions = function () {
            vm.windowWidth = window.width();
            vm.windowHeight = window.height();
        };

        $scope.$watch($scope.getWindowDimensions, updateDimensions, true);

        window.bind('resize', function () {
            $scope.$apply();
        });

        function swipeStatus(event, phase, direction, distance, duration, fingerCount, fingerData, currentDirection) {
            if(!carousel) {
                return;
            }

            var left = direction == 'left';
            var right = direction == 'right';
            var directionMultiplier = (left ? -1 : 1);

            dashboardPrev();
        }
        // $(".carousel").swipeleft(function() {
        //     dashboardNext();
        // });

        // Timer to change module in slideshow -mode
        $interval(function() {
            if (vm.slideshowMode) {
                modulesService.goNext();
            }
        }, 15000);


        $scope.scrollTo = function(id) {
          $location.hash(id);
          $anchorScroll();
       }

        $scope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
            vm.isMacro = isMacroState(toState);
        });

        function backToMicros() {
            vm.slideshowMode = false;
            $state.go('channel');
            updatePaginationCharts();
        }

        function nextButton() {
            vm.slideshowMode = false;
            modulesService.goNext();
        }

        function prevButton() {
            vm.slideshowMode = false;
            modulesService.goPrevious();
        }

        function updatePaginationCharts() {
          // Set timeout so charts only update once page has updated
            $timeout(function() {
              $('ses-dashboard')
              .find('.ct-chart').each(function(i, e) {
                e.__chartist__.update();
              });
            }, 0);
        }

        function dashboardPrev() {
            $('#dashboard-carousel').carousel('prev');
            updatePaginationCharts();

        }

        function dashboardNext() {
            $('#dashboard-carousel').carousel('next');
            updatePaginationCharts();
        }

        function dashboardJumpTo(page) {
          $('#dashboard-carousel').carousel(page);
          updatePaginationCharts();
        }

        // Private
        function isMacroState(state) {
            return state.name == 'channel.module';
        }

        function toggleSlideshow() {
            vm.slideshowMode = !vm.slideshowMode;
            if (vm.slideshowMode) {
                modulesService.goNext();
            }
        }

        // Private
        /**
         * Groups elements of an array. Note that the last group will not
         * contain [numPerGroup] elements if the length of the array is not
         * divisible by [numPerGroup].
         *
         * @param  {Array[Object]}  array         Collection to group
         * @param  {number}         numPerGroup   Number of elements to group by
         * @return {Array[Array[Object]]}         The original objects, grouped
         */
        function grouped(array, numPerGroup) {
            var numElements = array.length;
            var numGroups = Math.ceil(numElements / numPerGroup);
            var groups = [];
            for (var groupIndex = 0; groupIndex < numGroups; groupIndex++) {
                var firstIndex = groupIndex*numPerGroup;
                var numInThisGroup = Math.min(numElements - firstIndex, numPerGroup);
                var group = [];
                for (var i = 0; i < numInThisGroup; i++) {
                    var index = firstIndex + i;
                    var element = array[index];
                    group.push(element);
                }
                groups.push(group);
            }
            return groups;
        }

        function updateModuleList(channel) {
            vm.modules = _(channel.modules).sortBy(function(module) {
                return module.ordernumber;
            });
            vm.groupedModules = grouped(vm.modules, 6);
        }
    }

})();
