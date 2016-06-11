(function() {
    'use strict';

    angular
        .module('app.dashboard')
        .factory('modulesService', modulesService);

    function modulesService($q, $state, configService, $stateParams) {
        var modulesPromise;
        reload();

        var service = {
            getModuleById: getModuleById,
            getModules: getModules,
            goNext: goNext,
            goPrevious: goPrevious,
            reload: reload
        };

        function getModuleById(id) {
            return getModules().then(function(modules) {
                return _(modules).findWhere({ id: id });
            });
        }

        function getModules() {
            return modulesPromise;
        }

        function goNext() {
            return modulesPromise.then(function(modules) {
                var nextIndex = (getCurrentModuleIndex(modules) + 1) % modules.length;
                $state.go('channel.module', {
                    moduleId: modules[nextIndex].id
                });
            });
        }

        function goPrevious() {
            return modulesPromise.then(function(modules) {
                var prevIndex = (getCurrentModuleIndex(modules) + modules.length - 1) % modules.length;
                $state.go('channel.module', {
                    moduleId: modules[prevIndex].id
                });
            });
        }

        function reload() {
            var channelName = $stateParams.channelName || 'default';
            modulesPromise = configService.one('channel', channelName).get().then(function(channel) {
                return _(channel.modules).sortBy(function(module) {
                    return module.ordernumber;
                });
            });
        }

        return service;

        // Helpers
        function getCurrentModuleIndex(modules) {
            return _(modules).findIndex(function(module) {
                return module.id == $state.params.moduleId;
            });
        }
    }
})();
